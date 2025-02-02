import React from 'react';

interface ApiInfo {
  id: string;
  name: string;
  description: string;
  category: string;
}

export interface MinimaxLiveInput {
  prompt: string;
  num_frames?: number;
  fps?: number;
  width?: number;
  height?: number;
  motion_bucket_id?: number;
  cond_aug?: number;
}

interface MinimaxLiveInterfaceProps {
  modelInfo: ApiInfo;
  onSubmit: (result: any) => void;
}

export const MinimaxLiveInterface: React.FC<MinimaxLiveInterfaceProps> = ({ modelInfo, onSubmit }) => {
  // Component implementation will go here
  return (
    <div>
      <h2>Minimax Live I2V</h2>
      {/* Form elements will go here */}
    </div>
  );
};

export default MinimaxLiveInterface; 