from PIL import Image
import io
from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
from style_transfer import run_style_transfer
import traceback

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/stylize', methods=['POST'])
def stylize():
    try:
        if 'content' not in request.files or 'style' not in request.files:
            return jsonify({'error': 'Missing file(s)'}), 400

        content_file = request.files['content'].read()
        style_file = request.files['style'].read()

        print("Files received, starting style transfer...")
        
        # Now run style transfer
        output_image = run_style_transfer(content_file, style_file)

        # Save to buffer and return as response
        img_io = io.BytesIO()
        output_image.save(img_io, 'PNG')
        img_io.seek(0)
        print("Sending image response...")
        return send_file(img_io, mimetype='image/png')
        
    except Exception as e:
        print(f"Error in stylize endpoint: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        return jsonify({'error': f'Style transfer failed: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
