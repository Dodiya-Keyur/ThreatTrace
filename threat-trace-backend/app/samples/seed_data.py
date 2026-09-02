DEFAULT_SAMPLE_RAW = """Received: from mail.corporate-gateway.net (mail.corporate-gateway.net [198.51.100.25])
	by mx.google.com with ESMTPS id x128si4891024qke.12.2026.08.31.09.14.02
	for <cfo-office@victim-corp.com>;
	Mon, 31 Aug 2026 09:14:02 -0400 (EDT)
Received: from relay-host.spoof-net.ru (relay-host.spoof-net.ru [185.220.101.4])
	by mail.corporate-gateway.net with ESMTP id 4X9810291
	for <cfo-office@victim-corp.com>;
	Mon, 31 Aug 2026 15:13:58 +0200
Received: from internal-smtp.local ([10.0.4.12])
	by relay-host.spoof-net.ru with ESMTP;
	Mon, 31 Aug 2026 16:13:40 +0300
From: "Jonathan Davis (CEO)" <j.davis-exec@payroll-update-sec.com>
To: "Sarah Jenkins (CFO)" <cfo-office@victim-corp.com>
Subject: URGENT: Wire Transfer Authorization for Q3 Acquisition
Date: Mon, 31 Aug 2026 09:13:35 -0400
Message-ID: <20260831091335.8491.qmail@payroll-update-sec.com>
Reply-To: "Jonathan Davis" <exec-finance-direct@mail-temp-secure.net>
Authentication-Results: mx.google.com;
       dkim=fail header.i=@payroll-update-sec.com header.s=default header.b=X9aF2;
       spf=softfail (google.com: domain of transition spoof-net.ru does not designate 185.220.101.4 as permitted sender) smtp.mailfrom=attacker@spoof-net.ru;
       dmarc=fail (p=REJECT dis=NONE) header.from=payroll-update-sec.com
Content-Type: text/html; charset="UTF-8"

<p>Sarah,</p>
<p>I am currently boarding a flight for the Q3 M&A closing. We need to initiate an immediate wire transfer of $245,000 to the escrow account for Project Titan before 11:00 AM EST today.</p>
<p>Please use the updated wire instructions provided here: <a href="https://payroll-update-sec.com/portal/wire_instructions.php">http://payroll-update-sec.com/portal/wire_instructions.php</a></p>
<p>Do not call my mobile as I will be off-grid until landing. Confirm receipt of wire immediately.</p>
<p>Best regards,<br>Jonathan Davis<br>Chief Executive Officer<br>Victim Corp International</p>"""
