### install nginx

```bash
sudo apt-get install -y nginx
run ip, not working then http open security
d /etc/nginx/sites-available
sudo vim default

location /v1/api {
    proxy_pass http://localhost:3055;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}
sudo nginx -t

sudo systemctl restart nginx
sudo tail -f /var/log/nginx/error.log
```
