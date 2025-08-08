import tensorflow as tf
import numpy as np
from PIL import Image
import io

# Helper: load and preprocess image
def load_img(data, max_dim=512):
    try:
        print("Decoding image from bytes...")
        img = Image.open(io.BytesIO(data)).convert('RGB')
        print(f"Original image size: {img.size}")
        img = img.resize((max_dim, max_dim))
        img = tf.keras.preprocessing.image.img_to_array(img)
        img = tf.image.convert_image_dtype(img, tf.float32)
        img = img[tf.newaxis, :]
        print(f"Processed image shape: {img.shape}")
        return img
    except Exception as e:
        print(f"Error loading image: {str(e)}")
        raise ValueError(f"Failed to load image: {str(e)}")

# Helper: deprocess image
import tensorflow as tf
import numpy as np
from PIL import Image

def tensor_to_image(tensor):
    """
    Convert a TF Variable / Tensor -> NumPy uint8 array -> PIL Image.
    Ensures values are in [0,255] and handles shapes [1,H,W,3] or [H,W,3].
    """
    # If TF Variable/Tensor, convert to numpy
    if isinstance(tensor, tf.Variable) or isinstance(tensor, tf.Tensor):
        tensor = tensor.numpy()

    # Now tensor is a numpy array
    # If batch dimension present, remove it
    if tensor.ndim == 4:
        tensor = tensor[0]

    # Debug: print ranges (will show in backend terminal)
    try:
        print(f"[DEBUG] tensor min={tensor.min():.6f}, max={tensor.max():.6f}, dtype={tensor.dtype}")
    except Exception:
        pass

    # If values look like they are already in 0..1 range (float), scale to 0..255
    if np.issubdtype(tensor.dtype, np.floating):
        # protect against constant tensor (all equal) to avoid divide-by-zero
        tmin = tensor.min()
        tmax = tensor.max()
        if tmax - tmin < 1e-6:
            # fallback: clip to 0..1 then multiply
            tensor = np.clip(tensor, 0.0, 1.0)
            arr = (tensor * 255.0).astype(np.uint8)
        else:
            # Normalize to 0..1 then scale
            tensor = (tensor - tmin) / (tmax - tmin)
            arr = (tensor * 255.0).astype(np.uint8)
    else:
        # integer types: clip to 0..255 and cast
        arr = np.clip(tensor, 0, 255).astype(np.uint8)

    # If there are 4 channels (RGBA), drop alpha
    if arr.shape[-1] == 4:
        arr = arr[..., :3]

    return Image.fromarray(arr)

# Load VGG19
def vgg_layers(layer_names):
    try:
        print("Loading VGG19 model...")
        vgg = tf.keras.applications.VGG19(include_top=False, weights='imagenet')
        vgg.trainable = False
        outputs = [vgg.get_layer(name).output for name in layer_names]
        model = tf.keras.Model([vgg.input], outputs)
        print("VGG19 model loaded successfully")
        return model
    except Exception as e:
        print(f"Error loading VGG19: {str(e)}")
        raise ValueError(f"Failed to load VGG19 model: {str(e)}")

# Feature extraction
class StyleContentModel(tf.keras.models.Model):
    def __init__(self, style_layers, content_layers):
        super().__init__()
        self.vgg = vgg_layers(style_layers + content_layers)
        self.style_layers = style_layers
        self.content_layers = content_layers
        self.num_style_layers = len(style_layers)

    def call(self, inputs):
        inputs = inputs * 255.0
        preprocessed = tf.keras.applications.vgg19.preprocess_input(inputs)
        outputs = self.vgg(preprocessed)
        style_outputs, content_outputs = (outputs[:self.num_style_layers],
                                          outputs[self.num_style_layers:])
        style = [gram_matrix(o) for o in style_outputs]
        content = content_outputs
        return {'style': style, 'content': content}

def gram_matrix(input_tensor):
    result = tf.linalg.einsum('bijc,bijd->bcd', input_tensor, input_tensor)
    input_shape = tf.shape(input_tensor)
    num_locations = tf.cast(input_shape[1]*input_shape[2], tf.float32)
    return result / num_locations

# Main style transfer function
def run_style_transfer(content_data, style_data, epochs=5, steps_per_epoch=50):
    try:
        print("Starting style transfer process...")
        content_image = load_img(content_data)
        style_image = load_img(style_data)
        print("Images loaded successfully")
        
        style_layers = ['block1_conv1', 'block2_conv1', 'block3_conv1', 'block4_conv1']
        content_layers = ['block5_conv2']

        print("Creating style content model...")
        extractor = StyleContentModel(style_layers, content_layers)
        style_targets = extractor(style_image)['style']
        content_targets = extractor(content_image)['content']
        print("Style and content targets extracted")

        image = tf.Variable(content_image)
        opt = tf.optimizers.Adam(learning_rate=0.02, beta_1=0.99, epsilon=1e-1)

        style_weight = 1e-2
        content_weight = 1e4

        @tf.function()
        def train_step():
            with tf.GradientTape() as tape:
                outputs = extractor(image)
                style_loss = tf.add_n([tf.reduce_mean((o - t) ** 2) 
                                       for o, t in zip(outputs['style'], style_targets)])
                content_loss = tf.add_n([tf.reduce_mean((o - t) ** 2) 
                                         for o, t in zip(outputs['content'], content_targets)])
                loss = style_loss * style_weight + content_loss * content_weight

            grad = tape.gradient(loss, image)
            opt.apply_gradients([(grad, image)])
            image.assign(tf.clip_by_value(image, 0.0, 1.0))

        print(f"Starting training with {epochs} epochs, {steps_per_epoch} steps per epoch")
        for n in range(epochs):
            print(f"Epoch {n+1}/{epochs}")
            for m in range(steps_per_epoch):
                train_step()
                if (m + 1) % 10 == 0:
                    print(f"  Step {m+1}/{steps_per_epoch} complete")

        print("Style transfer completed successfully.")
        return tensor_to_image(image)
        
    except Exception as e:
        print(f"Error in style transfer: {str(e)}")
        raise ValueError(f"Style transfer failed: {str(e)}")
