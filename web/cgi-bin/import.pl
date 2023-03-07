# import.pl
# (C) 2016 Alexander Huber <mailto:huber@eighteenthcenturypoetry.org>

our ($subpath, $pubpath, $sendmail, $receiver);

if ($ENV{'HTTP_HOST'} =~ /\.test/i) {        # development server (Mac)
    $sendmail = "/usr/sbin/sendmail ";
    $subpath = "../submitted/";
    $pubpath = "../resources/models/";
} elsif ($ENV{'HTTP_HOST'} =~ /\.local/i) {  # development server (Linux)
    $sendmail = "/usr/lib/sendmail ";
    $subpath = "../submitted/";
    $pubpath = "../resources/models/";
} else {                                     # production server
    $sendmail = "/usr/sbin/sendmail ";
    $subpath = "../submitted/";
    $pubpath = "../resources/models/";
}
$receiver = "alhuber1502\@gmail.com";

sub send_mail {
    local ($from, $email, $type) = @_;

    if ( $from == "" ) { $from = "TGA"; }
    if ( $email == "" ) { $email = "alexander\@hubers.org.uk"; }
    
    open(SENDMAIL, "|$sendmail -t ") || return 0;
    print SENDMAIL <<"MAIL_END";
From: $from <$email>
To: $receiver
Subject: ECPA contribution - $type
  
Dear Administrator,
  
An ECPA contribution ($type) has been received.
  
Login: http://www.eighteenthcenturypoetry.org/cgi-bin/review.cgi
 
This e-mail has been sent via the ECPA Website.

MAIL_END
close(SENDMAIL);
    
    return 1;
}

1;
