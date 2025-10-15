import { z } from 'zod';

// TC Kimlik No validation (11 digits)
const tcNoRegex = /^[1-9][0-9]{10}$/;

// Turkish phone number validation
const phoneRegex = /^(\+90|0)?[0-9]{10}$/;

export const registerSchema = z
  .object({
    adSoyad: z
      .string()
      .min(3, 'Ad Soyad en az 3 karakter olmalıdır')
      .max(100, 'Ad Soyad en fazla 100 karakter olabilir'),
    tcNo: z
      .string()
      .regex(tcNoRegex, 'Geçerli bir TC Kimlik No giriniz (11 haneli)'),
    eposta: z.string().email('Geçerli bir e-posta adresi giriniz'),
    telNo: z
      .string()
      .regex(phoneRegex, 'Geçerli bir telefon numarası giriniz'),
    dogumTarihi: z.string().min(1, 'Doğum tarihi seçiniz'),
    sifre: z
      .string()
      .min(6, 'Şifre en az 6 karakter olmalıdır')
      .max(100, 'Şifre en fazla 100 karakter olabilir'),
    sifreTekrar: z.string(),
  })
  .refine((data) => data.sifre === data.sifreTekrar, {
    message: 'Şifreler eşleşmiyor',
    path: ['sifreTekrar'],
  });

export const loginSchema = z.object({
  tcNo: z
    .string()
    .regex(tcNoRegex, 'Geçerli bir TC Kimlik No giriniz (11 haneli)'),
  sifre: z.string().min(1, 'Şifre giriniz'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
