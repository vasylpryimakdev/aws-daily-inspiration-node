import sgMail from "@sendgrid/mail";
import axios from "axios";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const API_URL = process.env.API_URL;

export const sendEmail = async () => {
  try {
    const [quote, subscribers] = await Promise.all([
      getQuote(),
      getSubscribers(),
    ]);

    const emailHTML = createEmailHTML(quote);

    await sgMail.send({
      to: subscribers,
      from: {
        email: process.env.SENDER_EMAIL,
        name: "Daily Words of Wisdom",
      },
      subject: "Daily Words of Wisdom",
      text: `${quote.quote} - ${quote.author}`,
      html: emailHTML,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Email sent successfully",
      }),
    };
  } catch (error) {
    console.error("Send email error:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Failed to send email",
        error: error.message,
      }),
    };
  }
};

const getSubscribers = async () => {
  const { data } = await axios.get(`${API_URL}/getSubscribers`);

  return data.map(({ email }) => email);
};

const getQuote = async () => {
  const { data } = await axios.get(`${API_URL}/quotes`);

  const quotes = data.quotes;

  return quotes[Math.floor(Math.random() * quotes.length)];
};

const createEmailHTML = ({ quote, author }) => `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Daily Words of Wisdom</title>
</head>

<body style="
  margin:0;
  padding:0;
  background:#f5f5f5;
  font-family:Arial, sans-serif;
">

<table width="100%" cellpadding="0" cellspacing="0">
<tr>
<td align="center">

<table width="600" cellpadding="0" cellspacing="0"
style="
  background:white;
  margin:40px auto;
  border-radius:12px;
  overflow:hidden;
">

<tr>
<td style="
  padding:40px;
  text-align:center;
">

<h2 style="color:#333;">
Daily Words of Wisdom
</h2>

<div style="
  background:#f0c5c5;
  padding:30px;
  border-radius:8px;
  margin-top:30px;
">

<p style="
  font-size:20px;
  line-height:1.6;
  color:#333;
">
"${quote}"
</p>

<p style="
  color:#666;
  font-style:italic;
">
— ${author}
</p>

</div>

</td>
</tr>


<tr>
<td style="
  padding:20px;
  text-align:center;
  color:#999;
  font-size:14px;
">

<a href="#" style="
  color:#999;
  text-decoration:none;
">
Unsubscribe
</a>

&nbsp; | &nbsp;

<a href="#" style="
  color:#999;
  text-decoration:none;
">
About Us
</a>

</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>
`;
