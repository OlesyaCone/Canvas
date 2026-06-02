import nodemailer from "nodemailer";

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
    subject: "Подтверждение email",
    html: `<h2>Подтвердите email</h2><a href="${verifyUrl}">Подтвердить</a>`,
  });
};

export const sendTestAssignedEmail = async (
  to: string,
  username: string,
  groupName: string,
  testTitle: string,
  link: string,
  deadline?: string
) => {
  const deadlineText = deadline
    ? `<p>Дедлайн: <strong>${new Date(deadline).toLocaleDateString()}</strong></p>`
    : '';

  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT),
    secure: true,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Canvas" <${process.env.MAIL_USER}>`,
    to,
    subject: `Назначен новый тест в группе "${groupName}"`,
    html: `
      <h2>Привет, ${username}!</h2>
      <p>В группе <strong>${groupName}</strong> назначен новый тест:</p>
      <h3>${testTitle}</h3>
      ${deadlineText}
      <p>Перейдите по ссылке, чтобы пройти тест:</p>
      <a href="${link}">${link}</a>
    `,
  });
};