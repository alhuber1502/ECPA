#!/usr/bin/perl
# handleRDF.cgi

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
    $path_inc = "/services/webpages/util/t/h/thomasgray.site.aplus.net/eighteenthcenturypoetry.org/cgi-bin/";
}

our ($subpath);

require($path_inc."import.pl");

my $cgi = CGI->new;

print $cgi->header($cgi->param('mimetype')+';charset=UTF-8');
open(my $fh, ">:encoding(UTF-8)", $subpath.$cgi->param('file')) or die "Could not open file: $!";
flock($fh, 2) or die "Could not lock file: $!";
print $fh decode('UTF-8',$cgi->param('myRDF'));
close $fh;
&send_mail ("Anonymous","anonymous\@anonymous.org","RDF file");
