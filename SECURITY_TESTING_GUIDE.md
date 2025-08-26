# 🔒 Security Testing Guide

This guide shows you how to test and demonstrate the security features implemented in your DinePerks application.

## 🚀 **How to Start Testing**

1. **Start the Backend Server:**
   ```bash
   cd Cs110-Project/backend
   node index.js
   ```

2. **Start the Frontend:**
   ```bash
   cd Cs110-Project/frontend
   npm start
   ```

3. **Open your browser** and go to `http://localhost:3000`

## 🧪 **Testing Security Features**

### **1. Input Validation Testing**

#### **A. User Registration Validation**

**Test 1: Invalid Username Characters**
1. Go to the registration page
2. Try to register with username: `user@name`
3. **Expected Result:** You'll see a red error message: "Username can only contain letters, numbers, and underscores"

**Test 2: Username Too Short**
1. Try username: `ab` (only 2 characters)
2. **Expected Result:** Error: "Username must be between 3 and 30 characters"

**Test 3: Username Too Long**
1. Try username: `thisisareallylongusernamethatistoolongforvalidation`
2. **Expected Result:** Error: "Username must be between 3 and 30 characters"

**Test 4: Password Too Short**
1. Try password: `123` (only 3 characters)
2. **Expected Result:** Error: "Password must be at least 6 characters long"

**Test 5: XSS Attempt**
1. Try username: `<script>alert('hacked')</script>`
2. **Expected Result:** Error: "Username can only contain letters, numbers, and underscores"

#### **B. Review System Validation**

**Test 1: Invalid Rating**
1. Go to any restaurant page
2. Try to submit a review with rating: `6` (out of range)
3. **Expected Result:** Error: "Rating must be between 1 and 5"

**Test 2: Comment Too Long**
1. Try to submit a review with a comment longer than 1000 characters
2. **Expected Result:** Error: "Comment must be between 1 and 1000 characters"

**Test 3: XSS in Comments**
1. Try comment: `<script>alert('xss attack')</script>`
2. **Expected Result:** The script tags will be escaped and stored as text, not executed

### **2. Security Headers Testing**

#### **A. Check Security Headers**

**Method 1: Browser Developer Tools**
1. Open browser developer tools (F12)
2. Go to Network tab
3. Make any request (like searching for a restaurant)
4. Click on the request and check "Response Headers"
5. **Look for these security headers:**
   - `X-Frame-Options: SAMEORIGIN`
   - `X-Content-Type-Options: nosniff`
   - `Content-Security-Policy`
   - `Strict-Transport-Security`

**Method 2: Using curl (Terminal)**
```bash
curl -I "http://localhost:3001/search?query=test"
```

**Expected Headers:**
```
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
Content-Security-Policy: default-src 'self';...
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

### **3. NoSQL Injection Prevention Testing**

#### **A. Search Query Injection**

**Test 1: Malicious Search Query**
1. In the search bar, try: `'; DROP DATABASE; --`
2. **Expected Result:** The search will be sanitized and treated as a regular search term

**Test 2: JavaScript Injection**
1. Try search: `<script>alert('injection')</script>`
2. **Expected Result:** The script tags will be escaped and won't execute

### **4. Request Size Limiting Testing**

#### **A. Large Request Test**

**Using curl:**
```bash
# Create a large JSON payload
curl -X POST "http://localhost:3001/user/register" \
  -H "Content-Type: application/json" \
  -d '{"username": "test", "password": "'$(printf 'a%.0s' {1..10000000})'"}'
```

**Expected Result:** Request will be rejected if it exceeds 10MB limit

## 🎯 **Demonstration Scenarios**

### **Scenario 1: "Before vs After" Demo**

**Show the audience:**
1. **Before:** "Without validation, someone could register with username `admin'; DROP TABLE users; --`"
2. **After:** "Now try the same username - see how it's blocked with a clear error message"

### **Scenario 2: XSS Prevention Demo**

**Show the audience:**
1. Try to submit a review with comment: `<script>alert('You are hacked!')</script>`
2. Show that the script doesn't execute
3. Check the database to show it's stored as escaped text

### **Scenario 3: Security Headers Demo**

**Show the audience:**
1. Open developer tools
2. Make a request
3. Point out the security headers
4. Explain what each header protects against

## 🔍 **What to Look For**

### **✅ Success Indicators:**

1. **Input Validation:**
   - Clear error messages for invalid input
   - No server crashes from malicious input
   - Input is properly sanitized

2. **Security Headers:**
   - All expected headers are present
   - Headers have appropriate values

3. **Error Handling:**
   - Graceful error messages
   - No sensitive information leaked in errors

### **❌ Red Flags:**

1. **Input Validation:**
   - Malicious input gets through
   - Server crashes on special characters
   - No error messages for invalid input

2. **Security Headers:**
   - Missing security headers
   - Headers with inappropriate values

## 📊 **Testing Checklist**

- [ ] User registration validation works
- [ ] Review submission validation works
- [ ] Search query sanitization works
- [ ] Security headers are present
- [ ] Error messages are user-friendly
- [ ] No server crashes from malicious input
- [ ] XSS attempts are blocked
- [ ] Request size limits are enforced

## 🎓 **For Class Presentation**

### **Key Points to Emphasize:**

1. **Real-world Impact:** These vulnerabilities are exploited daily
2. **Ease of Implementation:** Simple middleware can prevent major attacks
3. **User Experience:** Security doesn't have to hurt usability
4. **Industry Standards:** These are widely adopted practices

### **Demo Flow:**
1. Show the working application
2. Demonstrate a security vulnerability (what could happen)
3. Show the security fix in action
4. Explain the technical implementation
5. Discuss real-world implications

This testing guide helps you demonstrate that your security implementation is working correctly and protecting against common web vulnerabilities!
