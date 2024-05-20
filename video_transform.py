import cv2
import time
import sys
from PIL import Image
import os
import moviepy.editor as mp


ASCII_CHARS = ["1", "1", "1", "1", "1", "1", "0", "0", "0", "0", "0"]
frame_size = 150
frame_interval = 1.0 / 30.75

ASCII_LIST = []


# Extract frames from video
def extract_transform_generate(video_path, start_frame, number_of_frames=1000):
    capture = cv2.VideoCapture(video_path)
    capture.set(1, start_frame)  # Points cap to target frame
    current_frame = start_frame
    frame_count = 1
    ret, image_frame = capture.read()
    while ret and frame_count <= number_of_frames:
        ret, image_frame = capture.read()
        try:
            image = Image.fromarray(image_frame)
            ascii_characters = pixels_to_ascii(greyscale(image))  # get ascii characters
            pixel_count = len(ascii_characters)
            ascii_image = "".join(
                [ascii_characters[index:(index + frame_size)] for index in range(0, pixel_count, frame_size)])

            ASCII_LIST.append(ascii_image)

        except Exception as error:
            continue

        progress_bar(frame_count, number_of_frames)

        frame_count += 1  # increases internal frame counter
        current_frame += 1  # increases global frame counter

    capture.release()


# Progress bar code is courtesy of StackOverflow user: Aravind Voggu.
# Link to thread: https://stackoverflow.com/questions/6169217/replace-console-output-in-python
def progress_bar(current, total, barLength=25):
    progress = float(current) * 100 / total
    arrow = '#' * int(progress / 100 * barLength - 1)
    spaces = ' ' * (barLength - len(arrow))
    sys.stdout.write('\rProgress: [%s%s] %d%% Frame %d of %d frames' % (arrow, spaces, progress, current, total))


# Greyscale
def greyscale(image_frame):
    return image_frame.convert("L")


# Convert pixels to ascii
def pixels_to_ascii(image_frame):
    pixels = image_frame.getdata()
    characters = "".join([ASCII_CHARS[pixel // 25] for pixel in pixels])
    return characters



def preflight_operations(path):
    if os.path.exists(path):
        path_to_video = path.strip()
        cap = cv2.VideoCapture(path_to_video)
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        cap.release()

        video = mp.VideoFileClip(path_to_video)

        frames_per_process = int(total_frames / 4)

        process1_end_frame = frames_per_process
        process2_start_frame = process1_end_frame + 1
        process2_end_frame = process2_start_frame + frames_per_process
        process3_start_frame = process2_end_frame + 1
        process3_end_frame = process3_start_frame + frames_per_process
        process4_start_frame = process3_end_frame + 1
        process4_end_frame = total_frames - 1

        start_time = time.time()
        sys.stdout.write('Beginning ASCII generation...\n')
        extract_transform_generate(path_to_video, 1, process4_end_frame)
        execution_time = time.time() - start_time
        sys.stdout.write('ASCII generation completed! ASCII generation time: ' + str(execution_time))

        return total_frames

    else:
        sys.stdout.write('Warning file not found!\n')
import json
preflight_operations("BadApple_resized.mp4")
with open("frames.js", 'w+') as f:
    f.write("const frames = " + json.dumps(ASCII_LIST))