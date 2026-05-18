import nodemailer from 'nodemailer';

export const sendVerificationEmail = async (to: string, token: string) => {
  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT),
    secure: true,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

  await transporter.sendMail({
    from: `"Auth App" <${process.env.MAIL_USER}>`,
    to,
    subject: 'Подтверждение email',
    html: `<h2>Подтвердите email</h2><a href="${verifyUrl}">Подтвердить</a>`,
  });
};