import React from 'react';

interface ApiInfo {
  id: string;
  name: string;
  description: string;
  category: string;
}

export interface MMAudioInput {
  audio_url: string;
  sample_rate?: number;
  chunk_size?: number;
  overlap_size?: number;
}

interface MMAudioInterfaceProps {
  modelInfo: ApiInfo;
  onSubmit: (result: any) => void;
}

export const MMAudioInterface: React.FC<MMAudioInterfaceProps> = ({ modelInfo, onSubmit }) => {
  // Component implementation will go here
  return (
    <div>
      <h2>MMAudio V2</h2>
      {/* Form elements will go here */}
    </div>
  );
};

export default MMAudioInterface; 