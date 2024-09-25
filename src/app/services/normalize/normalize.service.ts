import { Injectable } from '@angular/core';
import * as tf from '@tensorflow/tfjs';
import { KeypointsService } from '../keypoints.service';

@Injectable({
  providedIn: 'root',
})
export class NormalizeService {
  constructor(private keypointsService: KeypointsService) {}

  PUNTOS: { [key: string]: number } = this.keypointsService.PUNTOS;
  get_center_point(
    landmarks: any,
    left_bodypart: number,
    right_bodypart: number
  ) {
    let left = tf.gather(landmarks, left_bodypart, 1);
    let right = tf.gather(landmarks, right_bodypart, 1);
    const center = tf.add(tf.mul(left, 0.5), tf.mul(right, 0.5));
    return center;
  }

  get_pose_size(landmarks: any, torso_size_multiplier = 2.5) {
    console.log(this.PUNTOS);

    let hips_center = this.get_center_point(
      landmarks,
      this.PUNTOS['LEFT_HIP'],
      this.PUNTOS['RIGHT_HIP']
    );
    let shoulders_center = this.get_center_point(
      landmarks,
      this.PUNTOS['LEFT_SHOULDER'],
      this.PUNTOS['RIGHT_SHOULDER']
    );
    let torso_size = tf.norm(tf.sub(shoulders_center, hips_center));
    let pose_center_new = this.get_center_point(
      landmarks,
      this.PUNTOS['LEFT_HIP'],
      this.PUNTOS['RIGHT_HIP']
    );
    pose_center_new = tf.expandDims(pose_center_new, 1);

    pose_center_new = tf.broadcastTo(pose_center_new, [1, 33, 2]);
    // return: shape(17,2)
    let d = tf.gather(tf.sub(landmarks, pose_center_new), 0, 0);
    let max_dist = tf.max(tf.norm(d, 'euclidean', 0));

    // normalize scale
    let pose_size = tf.maximum(
      tf.mul(torso_size, torso_size_multiplier),
      max_dist
    );
    return pose_size;
  }

  normalize_pose_landmarks(landmarks: any) {
    let pose_center = this.get_center_point(
      landmarks,
      this.PUNTOS['LEFT_HIP'],
      this.PUNTOS['RIGHT_HIP']
    );

    pose_center = tf.expandDims(pose_center, 1);

    pose_center = tf.broadcastTo(pose_center, [1, 33, 2]);

    landmarks = tf.sub(landmarks, pose_center);

    let pose_size = this.get_pose_size(landmarks);
    landmarks = tf.div(landmarks, pose_size);

    landmarks.array().then((array: any[]) => {
      console.log('Nuevo:', array);
    });
    return landmarks;
  }

  landmarks_to_embedding(landmarks: any) {
    // normalize landmarks 2D
    landmarks = this.normalize_pose_landmarks(tf.expandDims(landmarks, 0));
    let embedding = tf.reshape(landmarks, [1, 66]);
    return embedding;
  }
}
