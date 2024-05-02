/*
export const sendTwoFactorTokenEmail = async (email: string, token: string) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "2FA Code",

    html: html2fa({
      host: process.env.NEXT_PUBLIC_APP_URL!,
      email,
      label: token,
      subtitle: "Your 2FA code:",
    }),
  };

  // transporter.sendMail(mailOptions, (error, info) => {
  //   if (error) {
  //     console.log(error); // if anything goes wrong an error will show up in your terminal.
  //   } else {
  //     console.log(`Message sent: ${info.messageId}`); // if it's a success, a confirmation will show up in your terminal.
  //   }
  // });
  return await new Promise((resolve, reject) => {
    // send mail
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error); // if anything goes wrong an error will show up in your terminal.
        reject(error);
      } else {
        console.log(`Message sent: ${info.messageId}`); // if it's a success, a confirmation will show up in your terminal.
        resolve(info);
      }
    });
  });
};


function html2fa({
  host,
  email,
  label,
  subtitle,
}: {
  host: string;
  email: string;
  label: string;
  subtitle?: string;
}) {
  // Insert invisible space into domains and email address to prevent both the
  // email address and the domain from being turned into a hyperlink by email
  // clients like Outlook and Apple mail, as this is confusing because it seems
  // like they are supposed to click on their email address to sign in.
  const escapedEmail = `${email.replace(/\./g, "&#8203;.")}`;
  const escapedHost = `${host.replace(/\./g, "&#8203;.")}`;

  // Some simple styling options
  const backgroundColor = "#f9f9f9";
  const textColor = "#444444";
  const mainBackgroundColor = "#ffffff";
  const buttonBackgroundColor = "#ff0000";
  const buttonBorderColor = "#ff0000";
  const buttonTextColor = "#ffffff";

  return `
  <body style="background: ${backgroundColor}; padding-bottom: 60px">
  <table width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center" style="padding: 10px 0px 20px 0px; font-size: 22px; font-family: Helvetica, Arial, sans-serif; color: ${textColor};">
        <strong>${escapedHost}</strong>
      </td>
    </tr>
  </table>
  <table width="100%" border="0" cellspacing="20" cellpadding="0" style="background: ${mainBackgroundColor}; max-width: 600px; margin: auto; border-radius: 10px;">
  <tr>
      <td align="center" style="padding: 10px 0px 0px 0px; font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: ${textColor};">
        ${subtitle} 
      </td>
    </tr>
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td align="center" style="border-radius: 5px;" bgcolor="${buttonBackgroundColor}"><p style="font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: ${buttonTextColor}; text-decoration: none; border-radius: 5px; padding: 10px 20px; border: 1px solid ${buttonBorderColor}; display: inline-block; font-weight: bold;">${label}</p></td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td align="center" style="padding: 0px 0px 10px 0px; font-size: 16px; line-height: 22px; font-family: Helvetica, Arial, sans-serif; color: ${textColor};">
        If you did not request this email you can safely ignore it.
      </td>
    </tr>
  </table>
</body>
`;
}

*/
