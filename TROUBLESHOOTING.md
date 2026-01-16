# API Troubleshooting Guide

## Issue: No APIs Working

### Quick Checks:

1. **Backend Running?**
   ```bash
   # Check if backend is listening on port 8000
   netstat -ano | findstr :8000
   ```

2. **Frontend Dev Server Running?**
   - Should be on port 3001
   - Check terminal for errors

3. **Check Browser Console**
   - Open DevTools (F12)
   - Check Console tab for errors
   - Check Network tab to see requests/responses

### Common Issues:

#### 1. Backend Not Running
**Symptoms:** Network errors, "Failed to fetch"
**Fix:**
```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

#### 2. Proxy Not Working
**Symptoms:** 404 errors, requests going to wrong URL
**Fix:**
- Restart frontend dev server
- Check `vite.config.ts` proxy configuration
- Verify API_BASE_URL is `/api` (not `/api/v1`)

#### 3. CORS Errors
**Symptoms:** CORS policy errors in console
**Fix:**
- Backend CORS is set to allow all origins
- If still seeing errors, check backend is running

#### 4. Authentication Issues
**Symptoms:** 401 Unauthorized errors
**Fix:**
- Login again to get fresh token
- Check Redux store has auth token
- Some endpoints don't require auth (like `/dates`)

#### 5. Network Connection Issues
**Symptoms:** TypeError: Failed to fetch
**Fix:**
- Check backend is accessible: `curl http://localhost:8000/api/v1/health`
- Check firewall isn't blocking port 8000
- Verify proxy target is `http://localhost:8000`

### Test Endpoints:

1. **Health Check (No Auth)**
   ```
   Browser: http://localhost:3001/api/v1/health
   Direct: http://localhost:8000/api/v1/health
   ```

2. **Tender Dates (No Auth)**
   ```
   Browser: http://localhost:3001/api/v1/tenderiq/dates
   ```

3. **Wishlist (Auth Required)**
   ```
   Browser: http://localhost:3001/api/v1/tenderiq/wishlist
   ```

### Debug Steps:

1. Open browser DevTools (F12)
2. Go to Network tab
3. Filter by "Fetch/XHR"
4. Try an action that calls API
5. Check the request:
   - URL should be `/api/tenderiq/...` (frontend)
   - Should be proxied to `http://localhost:8000/api/v1/tenderiq/...`
   - Check status code and response

### Expected Behavior:

- Frontend calls: `/api/tenderiq/wishlist`
- Proxy rewrites to: `http://localhost:8000/api/v1/tenderiq/wishlist`
- Backend responds with JSON
- Frontend receives data

### If Still Not Working:

1. Check backend logs for errors
2. Check frontend console for specific error messages
3. Verify environment variables are set
4. Try accessing backend directly: `http://localhost:8000/api/v1/health`
5. Check if database is running (PostgreSQL)
