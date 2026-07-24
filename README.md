# Backend Skill Checkpoint — Q&A API (Quora-like)

REST API สำหรับระบบถาม–ตอบสไตล์ Quora  
ผู้ใช้สามารถสร้าง/ดู/แก้ไข/ลบคำถาม ค้นหาตามหัวข้อหรือหมวดหมู่ จัดการคำตอบ และโหวตคำถาม/คำตอบได้

พัฒนาด้วย **Node.js**, **Express.js** และ **PostgreSQL** ในฐานะ Backend Skill Checkpoint ของ TechUp

---

## Features

- **จัดการคำถาม (CRUD)** — สร้าง ดูทั้งหมด ดูตาม ID แก้ไข และลบ
- **หมวดหมู่** — คำถามมี `category` เช่น Software, Food, Travel, Science
- **ค้นหา** — ค้นจาก `title` และ/หรือ `category`
- **จัดการคำตอบ** — สร้าง/ดู/ลบคำตอบของคำถาม (ความยาวไม่เกิน 300 ตัวอักษร)
- **Cascade Delete** — เมื่อลบคำถาม คำตอบที่เกี่ยวข้องจะถูกลบตาม (ผ่าน `ON DELETE CASCADE` ใน PostgreSQL)
- **ระบบโหวต** — โหวต Agree (`+1`) / Disagree (`-1`) ให้คำถามและคำตอบ

---

## Tech Stack

| Technology | ใช้ทำอะไร |
|------------|-----------|
| Node.js | Runtime |
| Express.js | Web framework / REST API |
| PostgreSQL | Database |
| pg | Connection Pool ไปยัง PostgreSQL |
| dotenv | โหลดค่าจากไฟล์ `.env` |
| Postman | ทดสอบ API |

---

## Project Structure

```text
backend-skill-checkpoint-express-server/
├── app.mjs                 # จุดเริ่มต้น Express Server + เชื่อม Router
├── apps/
│   ├── questions.mjs       # Routes ของคำถาม, ค้นหา, คำตอบ, โหวตคำถาม
│   └── answers.mjs         # Route โหวตคำตอบ
├── utils/
│   └── db.mjs              # PostgreSQL Connection Pool
├── .env                    # ค่า Environment (ไม่ commit ขึ้น Git)
├── .gitignore
├── package.json
└── README.md
```

---

## Prerequisites

ติดตั้งซอฟต์แวร์เหล่านี้ก่อนเริ่ม:

- [Node.js](https://nodejs.org/) (แนะนำ v18+)
- [PostgreSQL](https://www.postgresql.org/download/)
- [Postman](https://www.postman.com/downloads/) (สำหรับทดสอบ API)
- (ทางเลือก) [pgAdmin 4](https://www.pgadmin.org/) สำหรับดูข้อมูลใน Database

---

## Installation

1. Clone โปรเจกต์

```bash
git clone https://github.com/jobthiramet/backend-skill-checkpoint-express-server.git
cd backend-skill-checkpoint-express-server
```

2. ติดตั้ง dependencies

```bash
npm install
```

3. สร้างไฟล์ `.env` ที่ root ของโปรเจกต์ แล้วใส่ค่า Database ของคุณ

```env
PORT=4000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your-password
DB_NAME=Quora_DB
```

> **หมายเหตุ:** อย่า commit ไฟล์ `.env` ขึ้น Git (ถูก ignore ไว้แล้ว)

---

## Database Setup

1. สร้าง database ใน PostgreSQL (เช่น `Quora_DB`)
2. สร้างตารางตามโจทย์ / SQL script ของคอร์ส โดยต้องมีอย่างน้อย:

| Table | รายละเอียดหลัก |
|-------|----------------|
| `questions` | `id`, `title`, `description`, `category` |
| `answers` | `id`, `question_id`, `content` (FK → questions, แนะนำ `ON DELETE CASCADE`) |
| `question_votes` | `id`, `question_id`, `vote` |
| `answer_votes` | `id`, `answer_id`, `vote` |

SQL script อ้างอิงจากคอร์ส:  
[Database SQL Script](https://gist.github.com/napatwongchr/811ef7071003602b94482b3d8c0f32e0)

---

## Running the Server

```bash
node app.mjs
```

หรือใช้ nodemon:

```bash
npm start
```

Server จะรันที่ **http://localhost:4000**

ทดสอบว่า Server ทำงาน:

```http
GET http://localhost:4000/test
```

Response ที่คาดหวัง:

```json
"Server API is working 🚀"
```

---

## API Endpoints

Base URL: `http://localhost:4000`

### Questions

| Method | Endpoint | คำอธิบาย |
|--------|----------|----------|
| `POST` | `/questions` | สร้างคำถามใหม่ |
| `GET` | `/questions` | ดูคำถามทั้งหมด |
| `GET` | `/questions/search?title=&category=` | ค้นหาจากหัวข้อและ/หรือหมวดหมู่ |
| `GET` | `/questions/:questionId` | ดูคำถามตาม ID |
| `PUT` | `/questions/:questionId` | แก้ไขคำถาม |
| `DELETE` | `/questions/:questionId` | ลบคำถาม (คำตอบจะถูกลบตามถ้าตั้ง CASCADE ไว้) |

### Answers

| Method | Endpoint | คำอธิบาย |
|--------|----------|----------|
| `POST` | `/questions/:questionId/answers` | สร้างคำตอบ (สูงสุด 300 ตัวอักษร) |
| `GET` | `/questions/:questionId/answers` | ดูคำตอบทั้งหมดของคำถาม |
| `DELETE` | `/questions/:questionId/answers` | ลบคำตอบทั้งหมดของคำถาม |

### Votes

| Method | Endpoint | คำอธิบาย |
|--------|----------|----------|
| `POST` | `/questions/:questionId/vote` | โหวตคำถาม (`vote`: `1` หรือ `-1`) |
| `POST` | `/answers/:answerId/vote` | โหวตคำตอบ (`vote`: `1` หรือ `-1`) |

### ตัวอย่าง Request Body

**สร้างคำถาม**

```http
POST /questions
Content-Type: application/json

{
  "title": "What is the capital of France?",
  "description": "This is a basic geography question asking about the capital city of France.",
  "category": "Geography"
}
```

**สร้างคำตอบ**

```http
POST /questions/1/answers
Content-Type: application/json

{
  "content": "The capital of France is Paris."
}
```

**โหวต**

```http
POST /questions/1/vote
Content-Type: application/json

{
  "vote": 1
}
```

---

## Testing with Postman

1. รัน Server ด้วย `node app.mjs`
2. เปิด Postman สร้าง Request ใหม่
3. ใส่ Method + URL เช่น `GET http://localhost:4000/questions`
4. ถ้าเป็น `POST` / `PUT` ให้เลือก **Body → raw → JSON** แล้วใส่ request body
5. กด **Send** แล้วตรวจสถานะและ response ให้ตรงกับ API Design

### ลำดับทดสอบที่แนะนำ

1. `GET /test`
2. `POST /questions`
3. `GET /questions`
4. `GET /questions/:questionId`
5. `PUT /questions/:questionId`
6. `GET /questions/search?category=Geography`
7. `POST /questions/:questionId/answers`
8. `GET /questions/:questionId/answers`
9. `POST /questions/:questionId/vote`
10. `POST /answers/:answerId/vote`
11. `DELETE /questions/:questionId/answers`
12. `DELETE /questions/:questionId` (แล้วเช็คว่า answers ถูกลบตาม)

---

## Requirement Checklist

| Requirement | สถานะ |
|-------------|--------|
| สร้างคำถาม (หัวข้อ, คำอธิบาย, หมวดหมู่) | ✅ |
| ดูคำถามทั้งหมด | ✅ |
| ดูคำถามตาม ID | ✅ |
| แก้ไขคำถาม | ✅ |
| ลบคำถาม | ✅ |
| ค้นหาจากหัวข้อหรือหมวดหมู่ | ✅ |
| สร้างคำตอบ (ไม่เกิน 300 ตัวอักษร) | ✅ |
| ดูคำตอบของคำถาม | ✅ |
| ลบคำถามแล้วคำตอบถูกลบตาม | ✅ (ต้องมี `ON DELETE CASCADE`) |
| อธิบายผลงานใน README | ✅ |

---

## Author

**jobthiramet**

- GitHub: [@jobthiramet](https://github.com/jobthiramet)

## Acknowledgments

- [TechUp Thailand](https://techupth.github.io/) — Backend Skill Checkpoint
- Database SQL Script โดย [napatwongchr](https://gist.github.com/napatwongchr/811ef7071003602b94482b3d8c0f32e0)
