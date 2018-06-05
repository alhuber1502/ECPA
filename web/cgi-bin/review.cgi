#!/usr/bin/perl
# review.cgi

=begin comment

Tool Web-based/command-line tool

Process: 


- one way of keeping this very simple would be to have a command line instead of a Web-based interface, the script would first output a list of files (docnames), then user can select one to process

- a number of display options would then be displayed depending on the status of the entries in the file, e.g. show new additions, show rejected, show accepted, show completed, etc.
- then the script would display one line at a time in human-readable format and offer a number of options at the bottom of each entry, e.g. skip (deal with later), escalate (mark requiring external input), delete, accept, reject, finish, ...
- each finished line would get pushed into an array and a new line would be shifted in until all lines are complete or the user hits finish at which point the completed, current, and still todo arrays would be written out into a new file replacing the current one
- the state of each entry could be controlled using additional parameters that could be modified as required...

- this would need to be run on the production server, on a copy of the current file, but how to deal with additions that  hapeen while processing the file??? at finish, run a diff between copy and current version, if different, append diff result to new version and save!

=end comment
=cut

use strict;
use warnings;
use Encode qw(decode encode);
use CGI;

our ($subpath);

$ENV{'HTTP_HOST'} = "www.eighteenthcenturypoetry.local";

require("import.pl");

my @files = <${subpath}*.txt>;
foreach my $file (@files) {
    my ($docname) = $file =~ m,.*/(.*?)\.txt,gsi;
    print $docname . ", " . $file . "\n";
    open (FILE, "<", $file);
    while ( my $line = <FILE>) {
	chomp($line);
	my $cgi = CGI->new($line);

	print "Saved:\n";
	$cgi->save(\*STDOUT);
	print "\n";

	my $params = $cgi->Vars;
	my %hash = %$params;
	foreach my $k (keys %hash) {
	    print "$k: $hash{$k}\n";
	}
	$params->{'name'} = "Zulunigger";
	%hash = %$params;
	foreach my $k (keys %hash) {
	    print "$k: $hash{$k}\n";
	}

	print "\nSaved 2:\n";
	$cgi->save(\*STDOUT);
	print "\n";

    }
    close (FILE);
}
