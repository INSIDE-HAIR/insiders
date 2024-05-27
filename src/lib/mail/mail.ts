import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendVerificationEmailResend = async (
  email: string,
  token: string
) => {
  const confirmLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/new-verification?token=${token}&email=${email}`;
  try {
    // Intenta enviar el email
    await resend.emails.send({
      from: process.env.EMAIL_FROM as string,
      to: email,
      subject: "Confirma tu email",
      html: `<!--
    * This email was built using Tabular.
    * For more information, visit https://tabular.email
    -->
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">
    <head>
    <title></title>
    <meta charset="UTF-8" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <!--[if !mso]>-->
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <!--<![endif]-->
    <meta name="x-apple-disable-message-reformatting" content="" />
    <meta content="target-densitydpi=device-dpi" name="viewport" />
    <meta content="true" name="HandheldFriendly" />
    <meta content="width=device-width" name="viewport" />
    <meta name="format-detection" content="telephone=no, date=no, address=no, email=no, url=no" />
    <style type="text/css">
    table {
    border-collapse: separate;
    table-layout: fixed;
    mso-table-lspace: 0pt;
    mso-table-rspace: 0pt
    }
    table td {
    border-collapse: collapse
    }
    .ExternalClass {
    width: 100%
    }
    .ExternalClass,
    .ExternalClass p,
    .ExternalClass span,
    .ExternalClass font,
    .ExternalClass td,
    .ExternalClass div {
    line-height: 100%
    }
    body, a, li, p, h1, h2, h3 {
    -ms-text-size-adjust: 100%;
    -webkit-text-size-adjust: 100%;
    }
    html {
    -webkit-text-size-adjust: none !important
    }
    body, #innerTable {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale
    }
    #innerTable img+div {
    display: none;
    display: none !important
    }
    img {
    Margin: 0;
    padding: 0;
    -ms-interpolation-mode: bicubic
    }
    h1, h2, h3, p, a {
    line-height: 1;
    overflow-wrap: normal;
    white-space: normal;
    word-break: break-word
    }
    a {
    text-decoration: none
    }
    h1, h2, h3, p {
    min-width: 100%!important;
    width: 100%!important;
    max-width: 100%!important;
    display: inline-block!important;
    border: 0;
    padding: 0;
    margin: 0
    }
    a[x-apple-data-detectors] {
    color: inherit !important;
    text-decoration: none !important;
    font-size: inherit !important;
    font-family: inherit !important;
    font-weight: inherit !important;
    line-height: inherit !important
    }
    u + #body a {
    color: inherit;
    text-decoration: none;
    font-size: inherit;
    font-family: inherit;
    font-weight: inherit;
    line-height: inherit;
    }
    a[href^="mailto"],
    a[href^="tel"],
    a[href^="sms"] {
    color: inherit;
    text-decoration: none
    }
    img,p{margin:0;Margin:0;font-family:Fira Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:27px;font-weight:400;font-style:normal;font-size:18px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#bdbdbd;text-align:left;mso-line-height-rule:exactly;mso-text-raise:3px}h1{margin:0;Margin:0;font-family:Fira Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:33px;font-weight:700;font-style:normal;font-size:25px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#dcff93;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}h2{margin:0;Margin:0;font-family:Fira Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:30px;font-weight:700;font-style:normal;font-size:24px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#ddff94;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}h3{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:26px;font-weight:700;font-style:normal;font-size:20px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#ddff94;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}
    </style>
    <style type="text/css">
    @media (min-width: 481px) {
    .hd { display: none!important }
    }
    </style>
    <style type="text/css">
    @media (max-width: 480px) {
    .hm { display: none!important }
    }
    </style>
    <style type="text/css">
    @media (min-width: 481px) {
    h1,h2,img,p{font-family:Fira Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif}h2,h3{color:#ddff94;mso-text-raise:2px}img,p{margin:0;Margin:0;line-height:27px;font-weight:400;font-style:normal;font-size:18px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#bdbdbd;text-align:left;mso-line-height-rule:exactly;mso-text-raise:3px}h1,h2,h3{margin:0;Margin:0;font-weight:700;font-style:normal;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;text-align:left;mso-line-height-rule:exactly}h1{line-height:52px;font-size:48px;color:#dcff93;mso-text-raise:1px}h2{line-height:30px;font-size:24px}h3{font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:26px;font-size:20px}.t42{padding-top:50px!important;padding-bottom:50px!important;width:580px!important}.t34,.t40,.t49,.t5{max-width:600px!important}.t36,.t51,.t7{width:600px!important}.t3{padding:30px 50px!important}.t32{padding:50px!important}.t13,.t17,.t21,.t25,.t29{mso-line-height-alt:19px!important;line-height:19px!important}.t20,.t22{line-height:60px!important;mso-text-raise:13px!important}.t10,.t14{width:510px!important}.t22{width:260px!important}.t18{width:563px!important}.t53{mso-line-height-alt:50px!important;line-height:50px!important}.t26,.t30{width:603px!important}.t24,.t28{line-height:27px!important;font-size:14px!important;mso-text-raise:4px!important}
    }
    </style>
    <style type="text/css" media="screen and (min-width:481px)">.moz-text-html img,.moz-text-html p{margin:0;Margin:0;font-family:Fira Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:27px;font-weight:400;font-style:normal;font-size:18px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#bdbdbd;text-align:left;mso-line-height-rule:exactly;mso-text-raise:3px}.moz-text-html h1{margin:0;Margin:0;font-family:Fira Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:52px;font-weight:700;font-style:normal;font-size:48px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#dcff93;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px}.moz-text-html h2{margin:0;Margin:0;font-family:Fira Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:30px;font-weight:700;font-style:normal;font-size:24px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#ddff94;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}.moz-text-html h3{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:26px;font-weight:700;font-style:normal;font-size:20px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#ddff94;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}.moz-text-html .t42{padding-top:50px!important;padding-bottom:50px!important;width:580px!important}.moz-text-html .t40{max-width:600px!important}.moz-text-html .t7{width:600px!important}.moz-text-html .t5{max-width:600px!important}.moz-text-html .t3{padding:30px 50px!important}.moz-text-html .t36{width:600px!important}.moz-text-html .t34{max-width:600px!important}.moz-text-html .t32{padding:50px!important}.moz-text-html .t13{mso-line-height-alt:19px!important;line-height:19px!important}.moz-text-html .t14{width:510px!important}.moz-text-html .t21{mso-line-height-alt:19px!important;line-height:19px!important}.moz-text-html .t22{width:260px!important;line-height:60px!important;mso-text-raise:13px!important}.moz-text-html .t20{line-height:60px!important;mso-text-raise:13px!important}.moz-text-html .t17{mso-line-height-alt:19px!important;line-height:19px!important}.moz-text-html .t18{width:563px!important}.moz-text-html .t53{mso-line-height-alt:50px!important;line-height:50px!important}.moz-text-html .t51{width:600px!important}.moz-text-html .t49{max-width:600px!important}.moz-text-html .t29{mso-line-height-alt:19px!important;line-height:19px!important}.moz-text-html .t30{width:603px!important}.moz-text-html .t28{line-height:27px!important;font-size:14px!important;mso-text-raise:4px!important}.moz-text-html .t10{width:510px!important}.moz-text-html .t25{mso-line-height-alt:19px!important;line-height:19px!important}.moz-text-html .t26{width:603px!important}.moz-text-html .t24{line-height:27px!important;font-size:14px!important;mso-text-raise:4px!important}</style>
    <!--[if !mso]>-->
    <link href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;700&amp;family=Inter:wght@400;500;600&amp;family=Fira+Sans:wght@400&amp;display=swap" rel="stylesheet" type="text/css" />
    <!--<![endif]-->
    <!--[if mso]>
    <style type="text/css">
    img,p{margin:0;Margin:0;font-family:Fira Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:27px;font-weight:400;font-style:normal;font-size:18px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#bdbdbd;text-align:left;mso-line-height-rule:exactly;mso-text-raise:3px}h1{margin:0;Margin:0;font-family:Fira Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:52px;font-weight:700;font-style:normal;font-size:48px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#dcff93;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px}h2{margin:0;Margin:0;font-family:Fira Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:30px;font-weight:700;font-style:normal;font-size:24px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#ddff94;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}h3{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:26px;font-weight:700;font-style:normal;font-size:20px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#ddff94;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}td.t42{padding-top:50px !important;padding-bottom:50px !important;width:600px !important}div.t40{max-width:600px !important}td.t7{width:600px !important}div.t5{max-width:600px !important}td.t3{padding:30px 50px !important}td.t36{width:600px !important}div.t34{max-width:600px !important}td.t32{padding:50px !important}div.t13{mso-line-height-alt:19px !important;line-height:19px !important}td.t14{width:510px !important}div.t21{mso-line-height-alt:19px !important;line-height:19px !important}td.t22{width:260px !important;line-height:60px !important;mso-text-raise:13px !important}a.t20{line-height:60px !important;mso-text-raise:13px !important}div.t17{mso-line-height-alt:19px !important;line-height:19px !important}td.t18{width:563px !important}div.t53{mso-line-height-alt:50px !important;line-height:50px !important}td.t51{width:600px !important}div.t49{max-width:600px !important}div.t29{mso-line-height-alt:19px !important;line-height:19px !important}td.t30{width:603px !important}p.t28{line-height:27px !important;font-size:14px !important;mso-text-raise:4px !important}td.t10{width:510px !important}div.t25{mso-line-height-alt:19px !important;line-height:19px !important}td.t26{width:603px !important}p.t24{line-height:27px !important;font-size:14px !important;mso-text-raise:4px !important}
    </style>
    <![endif]-->
    <!--[if mso]>
    <xml>
    <o:OfficeDocumentSettings>
    <o:AllowPNG/>
    <o:PixelsPerInch>96</o:PixelsPerInch>
    </o:OfficeDocumentSettings>
    </xml>
    <![endif]-->
    </head>
    <body id="body" class="t56" style="min-width:100%;Margin:0px;padding:0px;background-color:#EDEDED;"><div class="t55" style="background-color:#EDEDED;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" align="center"><tr><td class="t54" style="font-size:0;line-height:0;mso-line-height-rule:exactly;background-color:#EDEDED;" valign="top" align="center">
    <!--[if mso]>
    <v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false">
    <v:fill color="#EDEDED"/>
    </v:background>
    <![endif]-->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" align="center" id="innerTable"><tr><td>
    <table class="t43" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
    <!--[if !mso]>--><td class="t42" style="width:460px;padding:20px 10px 20px 10px;">
    <!--<![endif]-->
    <!--[if mso]><td class="t42" style="width:480px;padding:20px 10px 20px 10px;"><![endif]-->
    <div class="t41" style="display:inline-table;width:100%;text-align:center;vertical-align:top;">
    <!--[if mso]>
    <table role="presentation" cellpadding="0" cellspacing="0" align="center" valign="top" width="580"><tr><td width="580" valign="top"><![endif]-->
    <div class="t40" style="display:inline-table;text-align:initial;vertical-align:inherit;width:100%;max-width:480px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t39"><tr>
    <td class="t38"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td>
    <table class="t8" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
    <!--[if !mso]>--><td class="t7" style="width:480px;">
    <!--<![endif]-->
    <!--[if mso]><td class="t7" style="width:480px;"><![endif]-->
    <div class="t6" style="display:inline-table;width:100%;text-align:center;vertical-align:middle;">
    <!--[if mso]>
    <table role="presentation" cellpadding="0" cellspacing="0" align="center" valign="middle" width="580"><tr><td width="580" valign="middle"><![endif]-->
    <div class="t5" style="display:inline-table;text-align:initial;vertical-align:inherit;width:100%;max-width:480px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t4"><tr>
    <td class="t3" style="border-bottom:1px solid #454545;overflow:hidden;background-color:#000000;padding:20px 30px 20px 30px;border-radius:8px 8px 0 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td>
    <table class="t2" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
    <!--[if !mso]>--><td class="t1" style="width:244px;">
    <!--<![endif]-->
    <!--[if mso]><td class="t1" style="width:244px;"><![endif]-->
    <div style="font-size:0px;"><img class="t0" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="244" height="61" alt="" src="https://5d91d786-6c10-497b-bcce-e683c621974e.b-cdn.net/e/5110faf0-152f-43ea-b485-f4b074a557a4/de9e3e00-51c0-49a1-8447-dd6bcc4108ca.png"/></div></td>
    </tr></table>
    </td></tr></table></td>
    </tr></table>
    </div>
    <!--[if mso]>
    </td>
    </tr></table>
    <![endif]-->
    </div></td>
    </tr></table>
    </td></tr><tr><td>
    <table class="t37" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
    <!--[if !mso]>--><td class="t36" style="width:480px;">
    <!--<![endif]-->
    <!--[if mso]><td class="t36" style="width:480px;"><![endif]-->
    <div class="t35" style="display:inline-table;width:100%;text-align:center;vertical-align:top;">
    <!--[if mso]>
    <table role="presentation" cellpadding="0" cellspacing="0" align="center" valign="top" width="580"><tr><td width="580" valign="top"><![endif]-->
    <div class="t34" style="display:inline-table;text-align:initial;vertical-align:inherit;width:100%;max-width:480px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t33"><tr>
    <td class="t32" style="border-bottom:1px solid #F7F7F7;overflow:hidden;background-color:#FFFFFF;padding:30px 30px 30px 30px;border-radius:0 0 8px 8px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td>
    <table class="t11" role="presentation" cellpadding="0" cellspacing="0" align="left"><tr>
    <!--[if !mso]>--><td class="t10" style="width:480px;">
    <!--<![endif]-->
    <!--[if mso]><td class="t10" style="width:480px;"><![endif]-->
    <h1 class="t9" style="margin:0;Margin:0;font-family:Inter Tight,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:40px;font-weight:700;font-style:normal;font-size:35px;text-decoration:none;text-transform:none;direction:ltr;color:#000000;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;">¡Solo falta un paso!</h1></td>
    </tr></table>
    </td></tr><tr><td><div class="t13" style="mso-line-height-rule:exactly;mso-line-height-alt:20px;line-height:20px;font-size:1px;display:block;">&nbsp;</div></td></tr><tr><td>
    <table class="t15" role="presentation" cellpadding="0" cellspacing="0" align="left"><tr>
    <!--[if !mso]>--><td class="t14" style="width:480px;">
    <!--<![endif]-->
    <!--[if mso]><td class="t14" style="width:480px;"><![endif]-->
    <h1 class="t12" style="margin:0;Margin:0;font-family:Inter Tight,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:40px;font-weight:400;font-style:normal;font-size:24px;text-decoration:none;text-transform:none;direction:ltr;color:#000000;text-align:left;mso-line-height-rule:exactly;mso-text-raise:5px;">Casi completas tu registro en INSIDERS</h1></td>
    </tr></table>
    </td></tr><tr><td><div class="t17" style="mso-line-height-rule:exactly;mso-line-height-alt:20px;line-height:20px;font-size:1px;display:block;">&nbsp;</div></td></tr><tr><td>
    <table class="t19" role="presentation" cellpadding="0" cellspacing="0" align="left"><tr>
    <!--[if !mso]>--><td class="t18" style="width:480px;">
    <!--<![endif]-->
    <!--[if mso]><td class="t18" style="width:480px;"><![endif]-->
    <p class="t16" style="margin:0;Margin:0;font-family:Inter,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:28px;font-weight:500;font-style:normal;font-size:16px;text-decoration:none;text-transform:none;direction:ltr;color:#333333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:4px;">Por favor, haz clic en el botón de confirmación a continuación para verificar tu dirección de correo electrónico y comenzar a disfrutar de todos los beneficios que tenemos para ofrecerte.</p></td>
    </tr></table>
    </td></tr><tr><td><div class="t21" style="mso-line-height-rule:exactly;mso-line-height-alt:20px;line-height:20px;font-size:1px;display:block;">&nbsp;</div></td></tr><tr><td>
    <table class="t23" role="presentation" cellpadding="0" cellspacing="0" align="left"><tr>
    <!--[if !mso]>--><td class="t22" style="background-color:#000000;overflow:hidden;width:326px;text-align:center;line-height:50px;mso-line-height-rule:exactly;mso-text-raise:10px;border-radius:14px 14px 14px 14px;">
    <!--<![endif]-->
    <!--[if mso]><td class="t22" style="background-color:#000000;overflow:hidden;width:326px;text-align:center;line-height:50px;mso-line-height-rule:exactly;mso-text-raise:10px;border-radius:14px 14px 14px 14px;"><![endif]-->
    <a class="t20" href=${confirmLink} style="display:block;margin:0;Margin:0;font-family:Inter,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:50px;font-weight:600;font-style:normal;font-size:18px;text-decoration:none;direction:ltr;color:#FFFFFF;text-align:center;mso-line-height-rule:exactly;mso-text-raise:10px;" target="_blank">¡Confirmar mi correo!</a></td>
    </tr></table>
    </td></tr><tr><td><div class="t25" style="mso-line-height-rule:exactly;mso-line-height-alt:20px;line-height:20px;font-size:1px;display:block;">&nbsp;</div></td></tr><tr><td>
    <table class="t27" role="presentation" cellpadding="0" cellspacing="0" align="left"><tr>
    <!--[if !mso]>--><td class="t26" style="width:480px;">
    <!--<![endif]-->
    <!--[if mso]><td class="t26" style="width:480px;"><![endif]-->
    <p class="t24" style="margin:0;Margin:0;font-family:Inter,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:23px;font-weight:400;font-style:normal;font-size:16px;text-decoration:none;text-transform:none;direction:ltr;color:#545454;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;">Si tienes alguna pregunta o necesitas ayuda, no dudes en ponerte en contacto con nuestro equipo de soporte.</p></td>
    </tr></table>
    </td></tr><tr><td><div class="t29" style="mso-line-height-rule:exactly;mso-line-height-alt:20px;line-height:20px;font-size:1px;display:block;">&nbsp;</div></td></tr><tr><td>
    <table class="t31" role="presentation" cellpadding="0" cellspacing="0" align="left"><tr>
    <!--[if !mso]>--><td class="t30" style="width:480px;">
    <!--<![endif]-->
    <!--[if mso]><td class="t30" style="width:480px;"><![endif]-->
    <p class="t28" style="margin:0;Margin:0;font-family:Inter,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:23px;font-weight:400;font-style:normal;font-size:16px;text-decoration:none;text-transform:none;direction:ltr;color:#545454;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;">Si no solicitaste ingresar en nuestra plataforma, puedes ignorar y eliminar este correo electrónico,</p></td>
    </tr></table>
    </td></tr></table></td>
    </tr></table>
    </div>
    <!--[if mso]>
    </td>
    </tr></table>
    <![endif]-->
    </div></td>
    </tr></table>
    </td></tr></table></td>
    </tr></table>
    </div>
    <!--[if mso]>
    </td>
    </tr></table>
    <![endif]-->
    </div></td>
    </tr></table>
    </td></tr><tr><td>
    <table class="t52" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
    <!--[if !mso]>--><td class="t51" style="width:480px;">
    <!--<![endif]-->
    <!--[if mso]><td class="t51" style="width:480px;"><![endif]-->
    <div class="t50" style="display:inline-table;width:100%;text-align:center;vertical-align:top;">
    <!--[if mso]>
    <table role="presentation" cellpadding="0" cellspacing="0" align="center" valign="top" width="600"><tr><td width="600" valign="top"><![endif]-->
    <div class="t49" style="display:inline-table;text-align:initial;vertical-align:inherit;width:100%;max-width:480px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t48"><tr>
    <td class="t47" style="padding:0 50px 0 50px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td>
    <table class="t46" role="presentation" cellpadding="0" cellspacing="0" align="left"><tr>
    <!--[if !mso]>--><td class="t45" style="width:420px;">
    <!--<![endif]-->
    <!--[if mso]><td class="t45" style="width:420px;"><![endif]-->
    <p class="t44" style="margin:0;Margin:0;font-family:Fira Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:23px;font-weight:400;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;direction:ltr;color:#878787;text-align:left;mso-line-height-rule:exactly;mso-text-raise:3px;">© 2024 INSIDE HAIR. Todos los derechos reservados.<br/></p></td>
    </tr></table>
    </td></tr></table></td>
    </tr></table>
    </div>
    <!--[if mso]>
    </td>
    </tr></table>
    <![endif]-->
    </div></td>
    </tr></table>
    </td></tr><tr><td><div class="t53" style="mso-line-height-rule:exactly;mso-line-height-alt:20px;line-height:20px;font-size:1px;display:block;">&nbsp;</div></td></tr></table></td></tr></table></div></body>
    </html>`,
    });
    console.info("Email reenviado con éxito a:", email);
    // Puedes retornar algo o manejar el éxito aquí
  } catch (error) {
    // Maneja cualquier error que ocurra durante el envío del email
    console.error("Error al reenviar el email:", error);
    // Podrías lanzar el error nuevamente o manejarlo según sea necesario
    throw error;
  }
};

export const sendPasswordResetEmailResend = async (
  email: string,
  token: string
) => {
  const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/new-password?token=${token}`;
  try {
    // Intenta enviar el email
    await resend.emails.send({
      from: process.env.EMAIL_FROM as string,
      to: email,
      subject: "Resetear contraseña de INSIDERS",
      html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">
    <head>
    <title></title>
    <meta charset="UTF-8" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <!--[if !mso]>-->
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <!--<![endif]-->
    <meta name="x-apple-disable-message-reformatting" content="" />
    <meta content="target-densitydpi=device-dpi" name="viewport" />
    <meta content="true" name="HandheldFriendly" />
    <meta content="width=device-width" name="viewport" />
    <meta name="format-detection" content="telephone=no, date=no, address=no, email=no, url=no" />
    <style type="text/css">
    table {
    border-collapse: separate;
    table-layout: fixed;
    mso-table-lspace: 0pt;
    mso-table-rspace: 0pt
    }
    table td {
    border-collapse: collapse
    }
    .ExternalClass {
    width: 100%
    }
    .ExternalClass,
    .ExternalClass p,
    .ExternalClass span,
    .ExternalClass font,
    .ExternalClass td,
    .ExternalClass div {
    line-height: 100%
    }
    body, a, li, p, h1, h2, h3 {
    -ms-text-size-adjust: 100%;
    -webkit-text-size-adjust: 100%;
    }
    html {
    -webkit-text-size-adjust: none !important
    }
    body, #innerTable {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale
    }
    #innerTable img+div {
    display: none;
    display: none !important
    }
    img {
    Margin: 0;
    padding: 0;
    -ms-interpolation-mode: bicubic
    }
    h1, h2, h3, p, a {
    line-height: 1;
    overflow-wrap: normal;
    white-space: normal;
    word-break: break-word
    }
    a {
    text-decoration: none
    }
    h1, h2, h3, p {
    min-width: 100%!important;
    width: 100%!important;
    max-width: 100%!important;
    display: inline-block!important;
    border: 0;
    padding: 0;
    margin: 0
    }
    a[x-apple-data-detectors] {
    color: inherit !important;
    text-decoration: none !important;
    font-size: inherit !important;
    font-family: inherit !important;
    font-weight: inherit !important;
    line-height: inherit !important
    }
    u + #body a {
    color: inherit;
    text-decoration: none;
    font-size: inherit;
    font-family: inherit;
    font-weight: inherit;
    line-height: inherit;
    }
    a[href^="mailto"],
    a[href^="tel"],
    a[href^="sms"] {
    color: inherit;
    text-decoration: none
    }
    img,p{margin:0;Margin:0;font-family:Fira Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:27px;font-weight:400;font-style:normal;font-size:18px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#bdbdbd;text-align:left;mso-line-height-rule:exactly;mso-text-raise:3px}h1{margin:0;Margin:0;font-family:Fira Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:33px;font-weight:700;font-style:normal;font-size:25px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#dcff93;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}h2{margin:0;Margin:0;font-family:Fira Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:30px;font-weight:700;font-style:normal;font-size:24px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#ddff94;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}h3{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:26px;font-weight:700;font-style:normal;font-size:20px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#ddff94;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}
    </style>
    <style type="text/css">
    @media (min-width: 481px) {
    .hd { display: none!important }
    }
    </style>
    <style type="text/css">
    @media (max-width: 480px) {
    .hm { display: none!important }
    }
    </style>
    <style type="text/css">
    @media (min-width: 481px) {
    h1,h2,img,p{font-family:Fira Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif}h2,h3{color:#ddff94;mso-text-raise:2px}img,p{margin:0;Margin:0;line-height:27px;font-weight:400;font-style:normal;font-size:18px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#bdbdbd;text-align:left;mso-line-height-rule:exactly;mso-text-raise:3px}h1,h2,h3{margin:0;Margin:0;font-weight:700;font-style:normal;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;text-align:left;mso-line-height-rule:exactly}h1{line-height:52px;font-size:48px;color:#dcff93;mso-text-raise:1px}h2{line-height:30px;font-size:24px}h3{font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:26px;font-size:20px}.t38{padding-top:50px!important;padding-bottom:50px!important;width:580px!important}.t30,.t36,.t45,.t5{max-width:600px!important}.t32,.t47,.t7{width:600px!important}.t3{padding:30px 50px!important}.t28{padding:50px!important}.t13,.t17,.t21,.t25{mso-line-height-alt:19px!important;line-height:19px!important}.t20,.t22{line-height:60px!important;mso-text-raise:13px!important}.t10,.t14{width:510px!important}.t22{width:260px!important}.t18{width:563px!important}.t49{mso-line-height-alt:50px!important;line-height:50px!important}.t26{width:603px!important}.t24{line-height:27px!important;font-size:14px!important;mso-text-raise:4px!important}
    }
    </style>
    <style type="text/css" media="screen and (min-width:481px)">.moz-text-html img,.moz-text-html p{margin:0;Margin:0;font-family:Fira Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:27px;font-weight:400;font-style:normal;font-size:18px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#bdbdbd;text-align:left;mso-line-height-rule:exactly;mso-text-raise:3px}.moz-text-html h1{margin:0;Margin:0;font-family:Fira Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:52px;font-weight:700;font-style:normal;font-size:48px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#dcff93;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px}.moz-text-html h2{margin:0;Margin:0;font-family:Fira Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:30px;font-weight:700;font-style:normal;font-size:24px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#ddff94;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}.moz-text-html h3{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:26px;font-weight:700;font-style:normal;font-size:20px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#ddff94;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}.moz-text-html .t38{padding-top:50px!important;padding-bottom:50px!important;width:580px!important}.moz-text-html .t36{max-width:600px!important}.moz-text-html .t7{width:600px!important}.moz-text-html .t5{max-width:600px!important}.moz-text-html .t3{padding:30px 50px!important}.moz-text-html .t32{width:600px!important}.moz-text-html .t30{max-width:600px!important}.moz-text-html .t28{padding:50px!important}.moz-text-html .t13{mso-line-height-alt:19px!important;line-height:19px!important}.moz-text-html .t14{width:510px!important}.moz-text-html .t21{mso-line-height-alt:19px!important;line-height:19px!important}.moz-text-html .t22{width:260px!important;line-height:60px!important;mso-text-raise:13px!important}.moz-text-html .t20{line-height:60px!important;mso-text-raise:13px!important}.moz-text-html .t17{mso-line-height-alt:19px!important;line-height:19px!important}.moz-text-html .t18{width:563px!important}.moz-text-html .t49{mso-line-height-alt:50px!important;line-height:50px!important}.moz-text-html .t47{width:600px!important}.moz-text-html .t45{max-width:600px!important}.moz-text-html .t25{mso-line-height-alt:19px!important;line-height:19px!important}.moz-text-html .t26{width:603px!important}.moz-text-html .t24{line-height:27px!important;font-size:14px!important;mso-text-raise:4px!important}.moz-text-html .t10{width:510px!important}</style>
    <!--[if !mso]>-->
    <link href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;700&amp;family=Inter:wght@400;500;600&amp;family=Fira+Sans:wght@400&amp;display=swap" rel="stylesheet" type="text/css" />
    <!--<![endif]-->
    <!--[if mso]>
    <style type="text/css">
    img,p{margin:0;Margin:0;font-family:Fira Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:27px;font-weight:400;font-style:normal;font-size:18px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#bdbdbd;text-align:left;mso-line-height-rule:exactly;mso-text-raise:3px}h1{margin:0;Margin:0;font-family:Fira Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:52px;font-weight:700;font-style:normal;font-size:48px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#dcff93;text-align:left;mso-line-height-rule:exactly;mso-text-raise:1px}h2{margin:0;Margin:0;font-family:Fira Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:30px;font-weight:700;font-style:normal;font-size:24px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#ddff94;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}h3{margin:0;Margin:0;font-family:Lato,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:26px;font-weight:700;font-style:normal;font-size:20px;text-decoration:none;text-transform:none;letter-spacing:0;direction:ltr;color:#ddff94;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px}td.t38{padding-top:50px !important;padding-bottom:50px !important;width:600px !important}div.t36{max-width:600px !important}td.t7{width:600px !important}div.t5{max-width:600px !important}td.t3{padding:30px 50px !important}td.t32{width:600px !important}div.t30{max-width:600px !important}td.t28{padding:50px !important}div.t13{mso-line-height-alt:19px !important;line-height:19px !important}td.t14{width:510px !important}div.t21{mso-line-height-alt:19px !important;line-height:19px !important}td.t22{width:260px !important;line-height:60px !important;mso-text-raise:13px !important}a.t20{line-height:60px !important;mso-text-raise:13px !important}div.t17{mso-line-height-alt:19px !important;line-height:19px !important}td.t18{width:563px !important}div.t49{mso-line-height-alt:50px !important;line-height:50px !important}td.t47{width:600px !important}div.t45{max-width:600px !important}div.t25{mso-line-height-alt:19px !important;line-height:19px !important}td.t26{width:603px !important}p.t24{line-height:27px !important;font-size:14px !important;mso-text-raise:4px !important}td.t10{width:510px !important}
    </style>
    <![endif]-->
    <!--[if mso]>
    <xml>
    <o:OfficeDocumentSettings>
    <o:AllowPNG/>
    <o:PixelsPerInch>96</o:PixelsPerInch>
    </o:OfficeDocumentSettings>
    </xml>
    <![endif]-->
    </head>
    <body id="body" class="t52" style="min-width:100%;Margin:0px;padding:0px;background-color:#EDEDED;"><div class="t51" style="background-color:#EDEDED;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" align="center"><tr><td class="t50" style="font-size:0;line-height:0;mso-line-height-rule:exactly;background-color:#EDEDED;" valign="top" align="center">
    <!--[if mso]>
    <v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false">
    <v:fill color="#EDEDED"/>
    </v:background>
    <![endif]-->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" align="center" id="innerTable"><tr><td>
    <table class="t39" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
    <!--[if !mso]>--><td class="t38" style="width:460px;padding:20px 10px 20px 10px;">
    <!--<![endif]-->
    <!--[if mso]><td class="t38" style="width:480px;padding:20px 10px 20px 10px;"><![endif]-->
    <div class="t37" style="display:inline-table;width:100%;text-align:center;vertical-align:top;">
    <!--[if mso]>
    <table role="presentation" cellpadding="0" cellspacing="0" align="center" valign="top" width="580"><tr><td width="580" valign="top"><![endif]-->
    <div class="t36" style="display:inline-table;text-align:initial;vertical-align:inherit;width:100%;max-width:480px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t35"><tr>
    <td class="t34"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td>
    <table class="t8" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
    <!--[if !mso]>--><td class="t7" style="width:480px;">
    <!--<![endif]-->
    <!--[if mso]><td class="t7" style="width:480px;"><![endif]-->
    <div class="t6" style="display:inline-table;width:100%;text-align:center;vertical-align:middle;">
    <!--[if mso]>
    <table role="presentation" cellpadding="0" cellspacing="0" align="center" valign="middle" width="580"><tr><td width="580" valign="middle"><![endif]-->
    <div class="t5" style="display:inline-table;text-align:initial;vertical-align:inherit;width:100%;max-width:480px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t4"><tr>
    <td class="t3" style="border-bottom:1px solid #454545;overflow:hidden;background-color:#000000;padding:20px 30px 20px 30px;border-radius:8px 8px 0 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td>
    <table class="t2" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
    <!--[if !mso]>--><td class="t1" style="width:244px;">
    <!--<![endif]-->
    <!--[if mso]><td class="t1" style="width:244px;"><![endif]-->
    <div style="font-size:0px;"><img class="t0" style="display:block;border:0;height:auto;width:100%;Margin:0;max-width:100%;" width="244" height="61" alt="" src="https://5d91d786-6c10-497b-bcce-e683c621974e.b-cdn.net/e/5110faf0-152f-43ea-b485-f4b074a557a4/de9e3e00-51c0-49a1-8447-dd6bcc4108ca.png"/></div></td>
    </tr></table>
    </td></tr></table></td>
    </tr></table>
    </div>
    <!--[if mso]>
    </td>
    </tr></table>
    <![endif]-->
    </div></td>
    </tr></table>
    </td></tr><tr><td>
    <table class="t33" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
    <!--[if !mso]>--><td class="t32" style="width:480px;">
    <!--<![endif]-->
    <!--[if mso]><td class="t32" style="width:480px;"><![endif]-->
    <div class="t31" style="display:inline-table;width:100%;text-align:center;vertical-align:top;">
    <!--[if mso]>
    <table role="presentation" cellpadding="0" cellspacing="0" align="center" valign="top" width="580"><tr><td width="580" valign="top"><![endif]-->
    <div class="t30" style="display:inline-table;text-align:initial;vertical-align:inherit;width:100%;max-width:480px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t29"><tr>
    <td class="t28" style="border-bottom:1px solid #F7F7F7;overflow:hidden;background-color:#FFFFFF;padding:30px 30px 30px 30px;border-radius:0 0 8px 8px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td>
    <table class="t11" role="presentation" cellpadding="0" cellspacing="0" align="left"><tr>
    <!--[if !mso]>--><td class="t10" style="width:480px;">
    <!--<![endif]-->
    <!--[if mso]><td class="t10" style="width:480px;"><![endif]-->
    <h1 class="t9" style="margin:0;Margin:0;font-family:Inter Tight,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:40px;font-weight:700;font-style:normal;font-size:35px;text-decoration:none;text-transform:none;direction:ltr;color:#000000;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;">¿Has olvidado tu contraseña de INSIDERS?</h1></td>
    </tr></table>
    </td></tr><tr><td><div class="t13" style="mso-line-height-rule:exactly;mso-line-height-alt:20px;line-height:20px;font-size:1px;display:block;">&nbsp;</div></td></tr><tr><td>
    <table class="t15" role="presentation" cellpadding="0" cellspacing="0" align="left"><tr>
    <!--[if !mso]>--><td class="t14" style="width:480px;">
    <!--<![endif]-->
    <!--[if mso]><td class="t14" style="width:480px;"><![endif]-->
    <h1 class="t12" style="margin:0;Margin:0;font-family:Inter Tight,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:40px;font-weight:400;font-style:normal;font-size:24px;text-decoration:none;text-transform:none;direction:ltr;color:#000000;text-align:left;mso-line-height-rule:exactly;mso-text-raise:5px;">Tranquilo, nos pasa a los mejores.</h1></td>
    </tr></table>
    </td></tr><tr><td><div class="t17" style="mso-line-height-rule:exactly;mso-line-height-alt:20px;line-height:20px;font-size:1px;display:block;">&nbsp;</div></td></tr><tr><td>
    <table class="t19" role="presentation" cellpadding="0" cellspacing="0" align="left"><tr>
    <!--[if !mso]>--><td class="t18" style="width:480px;">
    <!--<![endif]-->
    <!--[if mso]><td class="t18" style="width:480px;"><![endif]-->
    <p class="t16" style="margin:0;Margin:0;font-family:Inter,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:28px;font-weight:500;font-style:normal;font-size:16px;text-decoration:none;text-transform:none;direction:ltr;color:#333333;text-align:left;mso-line-height-rule:exactly;mso-text-raise:4px;">Para restablecer tu contraseña, debe hacer clic en el siguiente botón. El enlace puede dejar de funcionar al cabo de un tiempo.</p></td>
    </tr></table>
    </td></tr><tr><td><div class="t21" style="mso-line-height-rule:exactly;mso-line-height-alt:20px;line-height:20px;font-size:1px;display:block;">&nbsp;</div></td></tr><tr><td>
    <table class="t23" role="presentation" cellpadding="0" cellspacing="0" align="left"><tr>
    <!--[if !mso]>--><td class="t22" style="background-color:#000000;overflow:hidden;width:326px;text-align:center;line-height:50px;mso-line-height-rule:exactly;mso-text-raise:10px;border-radius:14px 14px 14px 14px;">
    <!--<![endif]-->
    <!--[if mso]><td class="t22" style="background-color:#000000;overflow:hidden;width:326px;text-align:center;line-height:50px;mso-line-height-rule:exactly;mso-text-raise:10px;border-radius:14px 14px 14px 14px;"><![endif]-->
    <a class="t20" href=${resetLink} style="display:block;margin:0;Margin:0;font-family:Inter,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:50px;font-weight:600;font-style:normal;font-size:18px;text-decoration:none;direction:ltr;color:#FFFFFF;text-align:center;mso-line-height-rule:exactly;mso-text-raise:10px;" target="_blank">Restablecer contraseña</a></td>
    </tr></table>
    </td></tr><tr><td><div class="t25" style="mso-line-height-rule:exactly;mso-line-height-alt:20px;line-height:20px;font-size:1px;display:block;">&nbsp;</div></td></tr><tr><td>
    <table class="t27" role="presentation" cellpadding="0" cellspacing="0" align="left"><tr>
    <!--[if !mso]>--><td class="t26" style="width:480px;">
    <!--<![endif]-->
    <!--[if mso]><td class="t26" style="width:480px;"><![endif]-->
    <p class="t24" style="margin:0;Margin:0;font-family:Inter,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:23px;font-weight:400;font-style:normal;font-size:16px;text-decoration:none;text-transform:none;direction:ltr;color:#545454;text-align:left;mso-line-height-rule:exactly;mso-text-raise:2px;">Si no deseas cambiar tu contraseña o no solicitaste un restablecimiento, puedes ignorar y eliminar este correo electrónico.</p></td>
    </tr></table>
    </td></tr></table></td>
    </tr></table>
    </div>
    <!--[if mso]>
    </td>
    </tr></table>
    <![endif]-->
    </div></td>
    </tr></table>
    </td></tr></table></td>
    </tr></table>
    </div>
    <!--[if mso]>
    </td>
    </tr></table>
    <![endif]-->
    </div></td>
    </tr></table>
    </td></tr><tr><td>
    <table class="t48" role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
    <!--[if !mso]>--><td class="t47" style="width:480px;">
    <!--<![endif]-->
    <!--[if mso]><td class="t47" style="width:480px;"><![endif]-->
    <div class="t46" style="display:inline-table;width:100%;text-align:center;vertical-align:top;">
    <!--[if mso]>
    <table role="presentation" cellpadding="0" cellspacing="0" align="center" valign="top" width="600"><tr><td width="600" valign="top"><![endif]-->
    <div class="t45" style="display:inline-table;text-align:initial;vertical-align:inherit;width:100%;max-width:480px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="t44"><tr>
    <td class="t43" style="padding:0 50px 0 50px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td>
    <table class="t42" role="presentation" cellpadding="0" cellspacing="0" align="left"><tr>
    <!--[if !mso]>--><td class="t41" style="width:420px;">
    <!--<![endif]-->
    <!--[if mso]><td class="t41" style="width:420px;"><![endif]-->
    <p class="t40" style="margin:0;Margin:0;font-family:Fira Sans,BlinkMacSystemFont,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:23px;font-weight:400;font-style:normal;font-size:14px;text-decoration:none;text-transform:none;direction:ltr;color:#878787;text-align:left;mso-line-height-rule:exactly;mso-text-raise:3px;">© 2024 INSIDE HAIR. Todos los derechos reservados.<br/></p></td>
    </tr></table>
    </td></tr></table></td>
    </tr></table>
    </div>
    <!--[if mso]>
    </td>
    </tr></table>
    <![endif]-->
    </div></td>
    </tr></table>
    </td></tr><tr><td><div class="t49" style="mso-line-height-rule:exactly;mso-line-height-alt:20px;line-height:20px;font-size:1px;display:block;">&nbsp;</div></td></tr></table></td></tr></table></div></body>
    </html>`,
    });
    console.info("Email reenviado con éxito a:", email);
    // Puedes retornar algo o manejar el éxito aquí
  } catch (error) {
    // Maneja cualquier error que ocurra durante el envío del email
    console.error("Error al reenviar el email:", error);
    // Podrías lanzar el error nuevamente o manejarlo según sea necesario
    throw error;
  }
};

export const sendTwoFactorTokenEmailResend = async (
  email: string,
  token: string
) => {
  const confirmLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/new-verification?token=${token}&email=${email}`;

  try {
    // Intenta enviar el email
    await resend.emails.send({
      from: process.env.EMAIL_FROM as string,
      to: email,
      subject: "Confirma tu email",
      html: `<a href=${confirmLink} target="_blank">Two Factor Token Email!</a>
`,
    });
    console.info("Email reenviado con éxito a:", email);
    // Puedes retornar algo o manejar el éxito aquí
  } catch (error) {
    // Maneja cualquier error que ocurra durante el envío del email
    console.error("Error al reenviar el email:", error);
    // Podrías lanzar el error nuevamente o manejarlo según sea necesario
    throw error;
  }
};
