# Resend Email Setup Guide

## Why Resend?
- ✅ **Super easy setup** - No complex SMTP configuration
- ✅ **Free tier** - 100 emails/day, 3,000 emails/month
- ✅ **No credit card required** for free tier
- ✅ **No 2FA or app passwords needed**
- ✅ **Modern API** - Simple and clean

## Quick Setup (5 minutes)

### Step 1: Sign Up for Resend
1. Go to [resend.com](https://resend.com/)
2. Click "Get Started" or "Sign Up"
3. Sign up with your email
4. Verify your email address

### Step 2: Get Your API Key
1. Log in to your Resend dashboard
2. Click on "**API Keys**" in the left sidebar
3. Click "**Create API Key**"
4. Give it a name (e.g., "Hood Eatery Development")
5. Click "Create"
6. **Copy the API key** - it starts with `re_`
7. ⚠️ Save it somewhere safe - you won't see it again!

### Step 3: Add to Your .env File
Open your backend `.env` file and add:

```env
# Resend Email Configuration
RESEND_API_KEY=re_your_actual_api_key_here
RESEND_FROM_EMAIL=Hood Eatery <onboarding@resend.dev>
ADMIN_EMAIL=macleaann723@gmail.com
```

**Important Notes:**
- Replace `re_your_actual_api_key_here` with your actual API key from Resend
- Keep `onboarding@resend.dev` as the sender for testing (this is provided by Resend for free)
- The `ADMIN_EMAIL` is where support messages will be sent

### Step 4: Restart Your Backend Server
```bash
# Stop your server (Ctrl+C)
# Then restart it
npm run dev
```

### Step 5: Test It!
1. Start both frontend and backend servers
2. Go to the Contact page
3. Fill out the contact form
4. Click "Send Message"
5. Check your admin email (macleaann723@gmail.com) - you should receive the message!

## What Emails Are Sent?

### 1. Support Messages (Contact Form)
- **When**: User submits contact form
- **To**: Admin email (macleaann723@gmail.com)
- **From**: onboarding@resend.dev
- **Reply-To**: Customer's email

### 2. Order Confirmation
- **When**: Order is created (if customer provides email)
- **To**: Customer email
- **From**: onboarding@resend.dev
- **Contains**: Order details, order number, items

### 3. Order Status Updates
- **When**: Admin changes order status
- **To**: Customer email
- **From**: onboarding@resend.dev
- **Contains**: New status, order tracking info

## Using Your Own Domain (Production)

For production, you'll want to use your own domain instead of `onboarding@resend.dev`:

### Step 1: Add Your Domain in Resend
1. Go to Resend dashboard
2. Click "**Domains**"
3. Click "**Add Domain**"
4. Enter your domain (e.g., `hoodeatery.com`)

### Step 2: Add DNS Records
Resend will show you DNS records to add:
1. Copy the DNS records
2. Go to your domain provider (e.g., Namecheap, GoDaddy)
3. Add the DNS records
4. Wait for verification (usually a few minutes)

### Step 3: Update Your .env
```env
RESEND_FROM_EMAIL=Hood Eatery <noreply@hoodeatery.com>
```

## Troubleshooting

### Email not received?
1. **Check spam folder** - Emails might go to spam initially
2. **Check API key** - Make sure it starts with `re_` and is correct
3. **Check backend logs** - Look for error messages in terminal
4. **Verify email** - Make sure the recipient email is valid

### "Invalid API key" error?
- Double-check your API key in the `.env` file
- Make sure there are no extra spaces
- Restart your backend server after adding the key

### "Domain not verified" error?
- You're probably trying to use a custom domain that's not verified
- Use `onboarding@resend.dev` for testing
- Or verify your domain following the steps above

### Rate limit exceeded?
- Free tier: 100 emails/day
- If you need more, upgrade to a paid plan (very affordable)

## Free Tier Limits

**Resend Free Tier:**
- ✅ 100 emails per day
- ✅ 3,000 emails per month
- ✅ 1 verified domain
- ✅ Full API access
- ✅ Email tracking

**This is perfect for:**
- Development and testing
- Small restaurants
- MVP launches
- Getting started

**When to upgrade:**
- Your restaurant gets popular and you need more emails
- You want multiple domains
- You need priority support

## Need Help?

1. **Resend Documentation**: [docs.resend.com](https://resend.com/docs)
2. **Resend Discord**: Join their community
3. **Check logs**: Look at your terminal for error messages

## Testing Checklist

- [ ] API key is added to `.env`
- [ ] Backend server is restarted
- [ ] Contact form sends email successfully
- [ ] Admin receives support emails
- [ ] Order confirmation emails work (if email provided)
- [ ] Emails are not going to spam

---

That's it! Resend is now set up and ready to use. 🎉
