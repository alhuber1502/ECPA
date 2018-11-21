#!/usr/bin/perl
# handleXML.cgi

use strict;
use warnings;
use Encode qw(decode encode);
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
if ($cgi->param('option') && $cgi->param('option') eq 'up') {
    print $cgi->header('application/xml;charset=UTF-8');
    open(my $fh, ">:encoding(UTF-8)", $subpath.$cgi->param('file')."-".$cgi->param('source')."-".(time).".xml") or die "Could not open file: $!";
    flock($fh, 2) or die "Could not lock file: $!";
    print $fh decode('UTF-8',$cgi->param('myXML'));
    close $fh;
    &send_mail ("Anonymous","anonymous\@anonymous.org","XML file");
} elsif ($cgi->param('option') && $cgi->param('option') eq 'down') {
    print $cgi->header(-type=>'application/octet-stream',-'Content-Disposition'=>'attachment;filename="'.$cgi->param("file").'-'.(time).'.xml"');
    print $cgi->param('myXML');
}
