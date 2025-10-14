import jwt from 'jsonwebtoken';
import Brevo from '@getbrevo/brevo';

export const baseUrl = () =>
  process.env.BASE_URL
    ? process.env.BASE_URL
    : process.env.NODE_ENV !== 'production'
    ? 'http://localhost:3000'
    : 'https://yourdomain.com';

export const generateToken = (user) =>
  jwt.sign(
    {
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: !!user.isAdmin,
      isSeller: !!user.isSeller,
    },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );

export const isAuth = (req, res, next) => {
  const { authorization } = req.headers || {};
  if (!authorization) return res.status(401).send({ message: 'No Token' });

  const token = authorization.startsWith('Bearer ')
    ? authorization.slice(7)
    : authorization;

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err || !decoded) return res.status(401).send({ message: 'Invalid Token' });
    req.user = decoded;
    next();
  });
};

export const isAdmin = (req, res, next) =>
  req.user?.isAdmin ? next() : res.status(401).send({ message: 'Admin access denied' });

export const isSeller = (req, res, next) =>
  req.user?.isSeller || req.user?.isAdmin
    ? next()
    : res.status(403).send({ message: 'Seller or Admin only' });

export const isAdminOrOwner =
  (getOwnerId) =>
  async (req, res, next) => {
    try {
      if (req.user?.isAdmin) return next();
      const ownerId = await Promise.resolve(getOwnerId(req));
      if (!ownerId) return res.status(404).send({ message: 'Owner not found' });
      if (String(ownerId) === String(req.user?._id)) return next();
      return res.status(403).send({ message: 'Not owner' });
    } catch (e) {
      return res.status(500).send({ message: e.message || 'Owner check failed' });
    }
  };

export async function sendEmail({ to, subject, html }) {
  try {
    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
      console.warn('[MAIL] Missing BREVO_API_KEY');
      return { skipped: true };
    }
    if (!to || !subject || !html) {
      console.error('[MAIL] Missing fields:', { to, hasSubject: !!subject, hasHtml: !!html });
      return { error: 'Missing to/subject/html' };
    }

    const brevo = new Brevo.TransactionalEmailsApi();
    brevo.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, apiKey);

    const senderEmail = process.env.MAIL_FROM_EMAIL || process.env.MAIL_FROM;
    const senderName = process.env.MAIL_FROM_NAME || 'UrbanBazaar';
    if (!senderEmail) {
      console.warn('[MAIL] Missing MAIL_FROM_EMAIL / MAIL_FROM');
      return { skipped: true };
    }

    const normalizeAddress = (value) => {
      if (!value || typeof value !== 'string') return null;
      const m = value.match(/^(.*)<\s*(.+@.+)\s*>$/);
      return m ? { name: m[1].trim(), email: m[2].trim() } : { email: value.trim() };
    };

    const recipient = normalizeAddress(to);
    if (!recipient?.email) {
      console.error('[MAIL] Invalid recipient:', to);
      return { error: 'Invalid recipient' };
    }

    const sendSmtpEmail = new Brevo.SendSmtpEmail();
    sendSmtpEmail.sender = { name: senderName, email: senderEmail };
    sendSmtpEmail.to = [recipient];
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = html;

    const res = await brevo.sendTransacEmail(sendSmtpEmail);
    const status = res?.response?.statusCode ?? 0;
    const msgId = res?.body?.messageId ?? res?.messageId ?? 'unknown';
    console.log(`[MAIL] Brevo OK ${status} id=${msgId}`);
    return { ok: true, status, id: msgId };
  } catch (err) {
    const body = err?.response?.body;
    console.error('[MAIL] Brevo ERROR', body?.message || err.message, body || '');
    return { ok: false, error: body?.message || err.message };
  }
}

export const payOrderEmailTemplate = (order) => {
  return `<h1>Thanks for shopping with us</h1>
  <p>Hi ${order.user.name},</p>
  <p>We have finished processing your order.</p>
  <h2>[Order ${order._id}] (${new Date(order.createdAt).toISOString().substring(0, 10)})</h2>
  <table cellpadding="6" cellspacing="0" border="0" style="border-collapse:collapse;">
    <thead>
      <tr>
        <td><strong>Product</strong></td>
        <td><strong>Quantity</strong></td>
        <td><strong align="right">Price</strong></td>
      </tr>
    </thead>
    <tbody>
      ${
        order.orderItems
          .map(
            (item) => `
        <tr>
          <td>${item.name}</td>
          <td align="center">${item.quantity}</td>
          <td align="right">$${Number(item.price || 0).toFixed(2)}</td>
        </tr>`
          )
          .join('\n')
      }
    </tbody>
    <tfoot>
      <tr><td colspan="2">Items Price:</td><td align="right">$${Number(order.itemsPrice || 0).toFixed(2)}</td></tr>
      <tr><td colspan="2">Shipping Price:</td><td align="right">$${Number(order.shippingPrice || 0).toFixed(2)}</td></tr>
      <tr><td colspan="2"><strong>Total Price:</strong></td><td align="right"><strong>$${Number(order.totalPrice || 0).toFixed(2)}</strong></td></tr>
      <tr><td colspan="2">Payment Method:</td><td align="right">${order.paymentMethod}</td></tr>
    </tfoot>
  </table>
  <h2>Shipping address</h2>
  <p>
    ${order.shippingAddress.fullName},<br/>
    ${order.shippingAddress.address},<br/>
    ${order.shippingAddress.city},<br/>
    ${order.shippingAddress.country},<br/>
    ${order.shippingAddress.postalCode}
  </p>
  <hr/>
  <p>Thanks for shopping with us.</p>`;
};