from flask import Flask, render_template, request, jsonify
import os
import base64
from PIL import Image
import io

app = Flask(__name__)

@app.route('/', methods=["GET", "POST"])
def index():
    return render_template('index.html')


@app.route('/index.html', methods=["GET", "POST"])
def index1():
    return render_template('index.html')


@app.route('/about.html', methods=["GET"])
def about():
    return render_template('about.html')


@app.route('/paper.html', methods=["GET"])
def paper():
    return render_template('paper.html')


@app.route('/Contest.html', methods=["GET"])
def contest():
    return render_template('Contest.html')


@app.route('/contact.html', methods=["GET"])
def contact():
    return render_template('contact.html')


@app.route('/news-template.html', methods=["GET"])
def news():
    return render_template('news-template.html')


@app.route('/rain-fog-removal.html', methods=["GET"])
def rain():
    return render_template('rain-fog-removal.html')


@app.route('/low-light-enhancement.html', methods=["GET"])
def enhancement():
    return render_template('low-light-enhancement.html')


@app.route('/bokeh-blur.html', methods=["GET"])
def bokeh():
    return render_template('bokeh-blur.html')


@app.route('/3d-point-cloud.html', methods=["GET"])
def point():
    return render_template('dehaze.html')

@app.route('/derain', methods=["POST"])
def derain_image():
    try:
        json_data = request.get_json()
        if not json_data or 'image' not in json_data:
            return jsonify({'error': '缺少图像数据'}), 400

        base64_str = json_data['image']
        header, encoded = base64_str.split(",", 1)
        image_data = base64.b64decode(encoded)

        img = Image.open(io.BytesIO(image_data))

        print("接收到图片，开始模拟去雨处理...")
        processed_img = img.convert('L').convert('RGB')
        print("去雨AI处理完成！")

        buffered = io.BytesIO()
        processed_img.save(buffered, format="JPEG")
        img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")

        processed_image_data_url = f"data:image/jpeg;base64,{img_str}"

        return jsonify({'processedImageUrl': processed_image_data_url})

    except Exception as e:
        print(f"处理出错: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/lowlight', methods=["POST"])
def lowlight_image():
    try:
        json_data = request.get_json()
        if not json_data or 'image' not in json_data:
            return jsonify({'error': '缺少图像数据'}), 400

        base64_str = json_data['image']
        header, encoded = base64_str.split(",", 1)
        image_data = base64.b64decode(encoded)

        img = Image.open(io.BytesIO(image_data))

        print("接收到图片，开始模拟低光增强处理...")
        processed_img = img.convert('L').convert('RGB')
        print("低光AI处理完成！")

        buffered = io.BytesIO()
        processed_img.save(buffered, format="JPEG")
        img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")

        processed_image_data_url = f"data:image/jpeg;base64,{img_str}"

        return jsonify({'processedImageUrl': processed_image_data_url})

    except Exception as e:
        print(f"处理出错: {e}")
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(port=5000, debug=True)