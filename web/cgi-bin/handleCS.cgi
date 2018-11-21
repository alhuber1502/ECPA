#!/usr/bin/perl
# handleCS.cgi

use strict;
use warnings;
use CGI;

my $path_inc;

if ($ENV{'HTTP_HOST'} =~ /\.test/i) {         # development server home
    $path_inc = "/Users/alhuber/Dropbox/projects/ecep/web/cgi-bin/";
} elsif ($ENV{'HTTP_HOST'} =~ /\.local/i) {   # development server work
    $path_inc = "/home/ahuber/projects/ecep/web/cgi-bin/";
} else {                                      # production
    $CGITempFile::TMPDIRECTORY = '/is/htdocs/user_tmp/wp13281444_FM2O9BY5QR/';
    $path_inc = "/is/htdocs/wp13281444_FM2O9BY5QR/www/eighteenthcenturypoetry.org/cgi-bin/";
}

our ($subpath);

require($path_inc."import.pl");

my $cgi = CGI->new;
if ($cgi->param('content')) {
    print $cgi->header('text/plain;charset=UTF-8');
    open(my $fh, ">>:encoding(UTF-8)", $subpath.$cgi->param('file').".txt") or die "Could not open file: $!";
    flock($fh, 2) or die "Could not lock file: $!";
    print $fh $cgi->param('content')."&source=".$cgi->param('source')."&timestamp=".(time)."\n";
    close $fh;
    my $query = CGI->new($cgi->param('content'));
    my %params = $query->Vars;
    &send_mail($params{'name'},$params{'e-mail'},"CS");
}
