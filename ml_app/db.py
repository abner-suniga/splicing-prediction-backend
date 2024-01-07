import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

postgres_url = os.getenv("DATABASE_URL")


def execute_db_query(query, args):
    conn = None
    try:
        conn = psycopg2.connect(postgres_url)
        cur = conn.cursor()
        cur.execute(query, args)
        conn.commit()
        cur.close()
        return True
    except (Exception, psycopg2.DatabaseError) as error:
        print("DatabaseError:", error)
    finally:
        if conn is not None:
            conn.close()


def insert_job(job_id, sequence_id):
    insert_job_query = """
        INSERT INTO jobs_sequences (id, status, sequence_id)
        VALUES (%s, 'PROCESSING', %s);
    """
    execute_db_query(insert_job_query, (job_id, sequence_id))


def update_success_job(job_id, result):
    update_job_query = """
        UPDATE jobs_sequences
        SET result = %s, status = 'SUCCESS'
        WHERE id = %s
    """
    execute_db_query(update_job_query, (result, job_id))


def update_fail_job(job_id):
    update_job_query = """
        UPDATE jobs_sequences
        SET status = 'FAIL':
        WHERE id = %s
    """
    execute_db_query(update_job_query, (job_id,))
