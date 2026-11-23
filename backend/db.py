
import mysql.connector

def get_db_connection():
    try:
        connection = mysql.connector.connect(
            host="localhost",
            user="root",
            password="LabLink@123",
            database="lablink"
        )

        print("LabLink database connected successfully!")
        return connection

    except mysql.connector.Error as error:
        print("Database connection failed:", error)
        return None


if __name__ == "__main__":
    db = get_db_connection()

    if db:
        db.close()
