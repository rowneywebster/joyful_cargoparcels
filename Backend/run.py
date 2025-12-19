from app import create_app

app = create_app('development')

# Add health check endpoint here
@app.route('/health')
def health_check():
    return {'status': 'healthy'}, 200

if __name__ == "__main__":
    app.run()