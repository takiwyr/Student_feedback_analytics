# Feedback Analytics Dashboard

Hệ thống phân tích feedback sinh viên real-time với machine learning, được xây dựng bằng FastAPI (Backend) và React (Frontend).

## Tính năng chính

- **Dashboard trực quan**: Hiển thị thống kê và biểu đồ phân tích feedback
- **ML Integration**: Tích hợp model phân loại sentiment và topic tự động
- **Lọc và tìm kiếm**: Filter theo sentiment, topic, thời gian
- **Real-time**: Cập nhật dữ liệu thời gian thực từ PostgreSQL
- **Responsive**: Giao diện thân thiện trên mọi thiết bị
- **Visualization**: Nhiều loại biểu đồ (Pie, Bar, Line, Stacked Bar)

## Kiến trúc hệ thống

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React App     │────│   FastAPI       │────│   PostgreSQL    │
│   (Frontend)    │    │   (Backend)     │    │   (Database)    │
│   Port: 3000    │    │   Port: 8000    │    │   Port: 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Yêu cầu hệ thống

- **Python**: 3.9+ 
- **Node.js**: 16+ 
- **PostgreSQL**: 12+
- **Git**: Latest version

## Cài đặt và chạy

### Cách 1: Setup thủ công (Khuyến nghị)

#### 1. Clone và setup dự án
```bash
git clone <repository-url>
cd feedback-analytics
```

#### 2. Setup Backend
```bash
cd backend

# Tạo virtual environment
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Cài đặt dependencies
pip install -r requirements.txt

# Chạy backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### 3. Setup Frontend (Terminal mới)
```bash
cd frontend

# Cài đặt dependencies
npm install

# Chạy frontend
npm start
```

### Cách 2: Sử dụng Docker
```bash
# Build và chạy tất cả services
docker-compose up --build

# Chạy ở background
docker-compose up -d
```

### Cách 3: Script tự động
```bash
# Cấp quyền thực thi
chmod +x start.sh

# Chạy script
./start.sh
```

## 🌐 Truy cập ứng dụng

| Service | URL | Mô tả |
|---------|-----|-------|
| **Frontend** | http://localhost:3000 | Dashboard chính |
| **Backend API** | http://localhost:8000 | REST API |
| **API Documentation** | http://localhost:8000/docs | Swagger UI |
| **Redoc** | http://localhost:8000/redoc | API docs alternative |

## 📊 Cấu trúc Database

### Bảng `prediction`
| Cột | Kiểu dữ liệu | Mô tả |
|-----|-------------|-------|
| `id` | INTEGER | Primary key |
| `feedback` | TEXT | Nội dung feedback |
| `sentiment` | INTEGER | 0=Negative, 1=Neutral, 2=Positive |
| `topic` | INTEGER | 0=Lecturer, 1=Training Program, 2=Facility, 3=Others |
| `created_at` | TIMESTAMP | Thời gian tạo |

## 🔧 Cấu hình

### Database Connection
```python
# backend/main.py
conn = psycopg2.connect(
    host="dpg-d13fg6je5dus73en4ip0-a.singapore-postgres.render.com",
    port=5432,
    database="feedback_storage",
    user="feedback_storage_user",
    password="wC2YkCcEIePy9mmbmWG6TT0LT8SAGuyx"
)
```

### Environment Variables
```bash
# Tạo file .env (tùy chọn)
DATABASE_URL=postgresql://user:password@host:port/database
API_HOST=localhost
API_PORT=8000
FRONTEND_PORT=3000
```

## 📁 Cấu trúc thư mục

```
feedback-analytics/
├── 📁 backend/
│   ├── main.py              # FastAPI application
│   ├── requirements.txt     # Python dependencies
│   └── Dockerfile          # Docker configuration
├── 📁 frontend/
│   ├── 📁 public/
│   │   └── index.html      # HTML template
│   ├── 📁 src/
│   │   ├── App.js          # Main React component
│   │   ├── index.js        # React entry point
│   │   └── index.css       # Tailwind CSS
│   ├── package.json        # Node.js dependencies
│   └── Dockerfile         # Docker configuration
├── docker-compose.yml      # Docker Compose
├── start.sh               # Start script
└── README.md             # Documentation
```

## 🎯 API Endpoints

### 📊 Statistics
- `GET /api/feedback/stats` - Thống kê tổng quan
- `GET /api/feedback/trends?days=30` - Xu hướng theo thời gian

### 📋 Data Management  
- `GET /api/feedback/data` - Lấy dữ liệu feedback (có phân trang)
- `GET /api/feedback/sentiment-by-topic` - Phân tích sentiment theo topic

### 🔍 Query Parameters
```
?page=1&limit=50          # Phân trang
&sentiment=0,1,2          # Filter sentiment
&topic=0,1,2,3           # Filter topic  
&start_date=2024-01-01   # Filter thời gian bắt đầu
&end_date=2024-12-31     # Filter thời gian kết thúc
```

## 📈 Dashboard Features

### 1. 📊 Overview Cards
- Tổng số feedback
- Feedback gần đây (7 ngày)
- Tỷ lệ sentiment tích cực
- Trạng thái cập nhật

### 2. 📉 Biểu đồ phân tích
- **Pie Chart**: Phân bố sentiment
- **Bar Chart**: Phân bố topic
- **Stacked Bar**: Sentiment theo từng topic
- **Line Chart**: Xu hướng theo thời gian

### 3. 🔍 Bảng dữ liệu
- Hiển thị chi tiết feedback
- Filter theo nhiều tiêu chí
- Phân trang tự động
- Sort theo thời gian

### 4. ⚡ Real-time Updates
- Tự động refresh dữ liệu
- Cập nhật theo thời gian thực
- Xử lý lỗi gracefully

## 🐛 Troubleshooting

### ❌ Lỗi thường gặp

#### 1. Database Connection Error
```bash
# Kiểm tra kết nối database
python -c "import psycopg2; print('OK')"

# Kiểm tra network
ping dpg-d13fg6je5dus73en4ip0-a.singapore-postgres.render.com
```

#### 2. CORS Error
```javascript
// Thêm proxy vào package.json
"proxy": "http://localhost:8000"
```

#### 3. Port đã được sử dụng
```bash
# Tìm process đang dùng port
lsof -i :8000
lsof -i :3000

# Kill process
kill -9 <PID>
```

#### 4. Module không tìm thấy
```bash
# Backend
pip install -r requirements.txt

# Frontend  
npm install
```

### 🔧 Debug Mode

#### Backend Debug
```bash
# Chạy với debug mode
uvicorn main:app --reload --log-level debug

# Kiểm tra logs
tail -f logs/app.log
```

#### Frontend Debug
```bash
# Chạy với debug
REACT_APP_DEBUG=true npm start

# Kiểm tra trong browser console
F12 → Console → Network tab
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
python -m pytest tests/
```

### Frontend Tests
```bash
cd frontend
npm test
```

### API Testing
```bash
# Sử dụng curl
curl -X GET "http://localhost:8000/api/feedback/stats"

# Sử dụng Postman
Import: http://localhost:8000/docs (OpenAPI)
```

## Deployment

### Production Setup
```bash
# Backend
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker

# Frontend
npm run build
serve -s build -l 3000
```

### Docker Production
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Nginx Configuration
```nginx
server {
    listen 80;
    
    location / {
        proxy_pass http://localhost:3000;
    }
    
    location /api {
        proxy_pass http://localhost:8000;
    }
}
```

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- **Email**: support@feedback-analytics.com
- **Documentation**: [Wiki](https://github.com/your-repo/wiki)
- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)

## Acknowledgments

- **FastAPI**: Modern web framework for Python
- **React**: Frontend library
- **Recharts**: Chart library for React
- **Tailwind CSS**: Utility-first CSS framework
- **PostgreSQL**: Advanced open source database

---

**Made with ❤️ by [Your Name]**

