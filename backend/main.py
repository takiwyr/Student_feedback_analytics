from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import psycopg2
import pandas as pd
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
import json
from pydantic import BaseModel

app = FastAPI(title="Feedback Analytics API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database connection
def get_db_connection():
    try:
        conn = psycopg2.connect(
            host="dpg-d13fg6je5dus73en4ip0-a.singapore-postgres.render.com",
            port=5432,
            database="feedback_storage",
            user="feedback_storage_user",
            password="wC2YkCcEIePy9mmbmWG6TT0LT8SAGuyx"
        )
        return conn
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database connection failed: {str(e)}")

# Mapping dictionaries
SENTIMENT_MAP = {0: "Negative", 1: "Neutral", 2: "Positive"}
TOPIC_MAP = {0: "Lecturer", 1: "Training Program", 2: "Facility", 3: "Others"}

class DateRange(BaseModel):
    start_date: Optional[str] = None
    end_date: Optional[str] = None

@app.get("/")
async def root():
    return {"message": "Feedback Analytics API", "version": "1.0.0"}

@app.get("/api/feedback/stats")
async def get_feedback_stats():
    """Get overall statistics of feedback data"""
    conn = get_db_connection()
    try:
        cur = conn.cursor()
        
        # Total count
        cur.execute("SELECT COUNT(*) FROM prediction")
        total_count = cur.fetchone()[0]
        
        # Sentiment distribution
        cur.execute("""
            SELECT sentiment, COUNT(*) 
            FROM prediction 
            GROUP BY sentiment 
            ORDER BY sentiment
        """)
        sentiment_data = cur.fetchall()
        
        # Topic distribution
        cur.execute("""
            SELECT topic, COUNT(*) 
            FROM prediction 
            GROUP BY topic 
            ORDER BY topic
        """)
        topic_data = cur.fetchall()
        
        # Recent feedback count (last 7 days)
        cur.execute("""
            SELECT COUNT(*) 
            FROM prediction 
            WHERE created_at >= NOW() - INTERVAL '7 days'
        """)
        recent_count = cur.fetchone()[0]
        
        return {
            "total_feedback": total_count,
            "recent_feedback": recent_count,
            "sentiment_distribution": [
                {"sentiment": SENTIMENT_MAP[row[0]], "count": row[1]} 
                for row in sentiment_data
            ],
            "topic_distribution": [
                {"topic": TOPIC_MAP[row[0]], "count": row[1]} 
                for row in topic_data
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

@app.get("/api/feedback/data")
async def get_feedback_data(
    page: int = 1,
    limit: int = 50,
    sentiment: Optional[int] = None,
    topic: Optional[int] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None
):
    """Get paginated feedback data with filters"""
    conn = get_db_connection()
    try:
        cur = conn.cursor()
        
        # Build WHERE clause
        where_conditions = []
        params = []
        
        if sentiment is not None:
            where_conditions.append("sentiment = %s")
            params.append(sentiment)
        
        if topic is not None:
            where_conditions.append("topic = %s")
            params.append(topic)
        
        if start_date:
            where_conditions.append("created_at >= %s")
            params.append(start_date)
        
        if end_date:
            where_conditions.append("created_at <= %s")
            params.append(end_date)
        
        where_clause = "WHERE " + " AND ".join(where_conditions) if where_conditions else ""
        
        # Get total count
        count_query = f"SELECT COUNT(*) FROM prediction {where_clause}"
        cur.execute(count_query, params)
        total_count = cur.fetchone()[0]
        
        # Get paginated data
        offset = (page - 1) * limit
        data_query = f"""
            SELECT id, feedback, sentiment, topic, created_at 
            FROM prediction 
            {where_clause}
            ORDER BY created_at DESC 
            LIMIT %s OFFSET %s
        """
        cur.execute(data_query, params + [limit, offset])
        
        rows = cur.fetchall()
        
        # Format data
        feedback_data = []
        for row in rows:
            feedback_data.append({
                "id": row[0],
                "feedback": row[1],
                "sentiment": SENTIMENT_MAP[row[2]],
                "sentiment_value": row[2],
                "topic": TOPIC_MAP[row[3]],
                "topic_value": row[3],
                "created_at": row[4].isoformat() if row[4] else None
            })
        
        return {
            "data": feedback_data,
            "total": total_count,
            "page": page,
            "limit": limit,
            "total_pages": (total_count + limit - 1) // limit
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

@app.get("/api/feedback/trends")
async def get_feedback_trends(days: int = 30):
    """Get feedback trends over time"""
    conn = get_db_connection()
    try:
        cur = conn.cursor()
        
        # Daily sentiment trends
        cur.execute("""
            SELECT 
                DATE(created_at) as date,
                sentiment,
                COUNT(*) as count
            FROM prediction 
            WHERE created_at >= NOW() - INTERVAL '%s days'
            GROUP BY DATE(created_at), sentiment
            ORDER BY date DESC, sentiment
        """, (days,))
        
        sentiment_trends = cur.fetchall()
        
        # Daily topic trends
        cur.execute("""
            SELECT 
                DATE(created_at) as date,
                topic,
                COUNT(*) as count
            FROM prediction 
            WHERE created_at >= NOW() - INTERVAL '%s days'
            GROUP BY DATE(created_at), topic
            ORDER BY date DESC, topic
        """, (days,))
        
        topic_trends = cur.fetchall()
        
        # Format data for charts
        sentiment_chart_data = {}
        for row in sentiment_trends:
            date_str = row[0].strftime('%Y-%m-%d')
            if date_str not in sentiment_chart_data:
                sentiment_chart_data[date_str] = {"date": date_str}
            sentiment_chart_data[date_str][SENTIMENT_MAP[row[1]]] = row[2]
        
        topic_chart_data = {}
        for row in topic_trends:
            date_str = row[0].strftime('%Y-%m-%d')
            if date_str not in topic_chart_data:
                topic_chart_data[date_str] = {"date": date_str}
            topic_chart_data[date_str][TOPIC_MAP[row[1]]] = row[2]
        
        return {
            "sentiment_trends": list(sentiment_chart_data.values()),
            "topic_trends": list(topic_chart_data.values())
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

@app.get("/api/feedback/sentiment-by-topic")
async def get_sentiment_by_topic():
    """Get sentiment distribution by topic"""
    conn = get_db_connection()
    try:
        cur = conn.cursor()
        
        cur.execute("""
            SELECT topic, sentiment, COUNT(*) as count
            FROM prediction
            GROUP BY topic, sentiment
            ORDER BY topic, sentiment
        """)
        
        results = cur.fetchall()
        
        # Format data for stacked bar chart
        data = {}
        for row in results:
            topic_name = TOPIC_MAP[row[0]]
            sentiment_name = SENTIMENT_MAP[row[1]]
            
            if topic_name not in data:
                data[topic_name] = {"topic": topic_name}
            
            data[topic_name][sentiment_name] = row[2]
        
        return {"data": list(data.values())}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)