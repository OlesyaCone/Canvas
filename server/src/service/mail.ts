import nodemailer from "nodemailer";
import dotenv from 'dotenv';

dotenv.config(); 

class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'localhost',
      port: Number(process.env.SMTP_PORT) || 1025,
      secure: false,
      ignoreTLS: true,
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASSWORD || '',
      },
    });
  }

  async sendActivationMail(to: string, link: string): Promise<void> {
    try {
      console.log(`📨 Отправка на ${to} через ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}`);
      
      const info = await this.transporter.sendMail({
        from: process.env.SMTP_USER || 'noreply@localhost',
        to,
        subject: "Активация аккаунта на " + process.env.API_URL,
        text: `Для активации перейдите по ссылке: ${link}`,
        html: `
          <div>
            <h1>Для активации перейдите по ссылке</h1>
            <a href="${link}">${link}</a>
          </div>
        `,
      });
      
    } catch (error) {
      console.error('❌ Ошибка:', error);
      throw error;
    }
  }
}

export default new MailService();