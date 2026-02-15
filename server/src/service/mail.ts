import nodemailer from "nodemailer";

class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST!,
      port: Number(process.env.SMTP_PORT!),
      secure: false,  
      requireTLS: true,
      auth: {
        user: process.env.SMTP_USER!,
        pass: process.env.SMTP_PASSWORD!,
      },
    });
  }

  async sendActivationMail(to: string, link: string): Promise<void> {
    await this.transporter.sendMail({
      from: process.env.SMTP_USER!,
      to,
      subject: "Активация аккаунта на " + process.env.API_URL,
      text: "",
      html: `
                <div>
                    <h1>Для активации перейдите по ссылке</h1>
                    <a href="${link}">${link}</a>
                </div>
            `,
    });
    console.log('API_URL:', process.env.API_URL);
  }
}

export default new MailService();