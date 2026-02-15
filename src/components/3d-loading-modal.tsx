'use client';

import React, { useEffect, useRef, useState } from 'react';
import { QueueRequest } from '@/hooks/useQueue';
import Image from 'next/image';

interface ThreeJSLoadingModalProps {
  isOpen: boolean;
  requests: QueueRequest[];
  onCancelRequest: (requestId: string, model: string) => Promise<{ success: boolean; message: string; }>;
}

const getModelIcon = (model: string): string => {
  const modelLower = model.toLowerCase();
  
  if (modelLower.includes('flux')) {
    return '/flux.svg';
  } else if (modelLower.includes('seedream') || modelLower.includes('bytedance')) {
    return '/bytedance-color.svg';
  } else if (modelLower.includes('kling')) {
    return '/kling-color.svg';
  } else if (modelLower.includes('minimax')) {
    return '/minimax-color.svg';
  } else if (modelLower.includes('luma') || modelLower.includes('dream-machine')) {
    return '/dreammachine.png';
  } else if (modelLower.includes('gemini')) {
    return '/gemini-color.svg';
  } else if (modelLower.includes('ideogram')) {
    return '/ideogram.svg';
  } else if (modelLower.includes('nano-banana')) {
    return '/bytedance-color.svg';
  } else {
    return '/flux.svg';
  }
};

const formatModelName = (model: string) => {
  const parts = model.split('/');
  return parts[parts.length - 1] || model;
};

export const ThreeJSLoadingModal: React.FC<ThreeJSLoadingModalProps> = ({
  isOpen,
  requests,
  onCancelRequest,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<any>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const [isThreeJSLoaded, setIsThreeJSLoaded] = useState(false);

  const activeRequests = requests.filter(req => 
    req.status === 'IN_QUEUE' || req.status === 'IN_PROGRESS'
  );

  useEffect(() => {
    if (!isOpen || activeRequests.length === 0) return;

    // Dynamically import Three.js
    const loadThreeJS = async () => {
      try {
        const THREE = await import('three');
        setIsThreeJSLoaded(true);
        initThreeJS(THREE);
      } catch (error) {
        console.error('Failed to load Three.js:', error);
      }
    };

    loadThreeJS();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isOpen, activeRequests.length]);

  const initThreeJS = (THREE: any) => {
    if (!mountRef.current) return;

    // Clear previous scene
    if (sceneRef.current) {
      mountRef.current.innerHTML = '';
    }

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(400, 300);
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);

    // Create 3D model icons based on active requests
    const meshes: any[] = [];
    const loader = new THREE.TextureLoader();
    
    // Create 3D representations of model icons
    if (activeRequests.length > 0) {
      activeRequests.forEach((request, index) => {
        const modelIcon = getModelIcon(request.model);
        
        // Create a plane geometry for the icon
        const geometry = new THREE.PlaneGeometry(1.5, 1.5);
        
        // Load the icon texture
        loader.load(modelIcon, (texture: any) => {
          const material = new THREE.MeshBasicMaterial({ 
            map: texture, 
            transparent: true,
            alphaTest: 0.1
          });
          
          const mesh = new THREE.Mesh(geometry, material);
          
          // Position in a circle around the center
          const angle = (index / activeRequests.length) * Math.PI * 2;
          const radius = 3;
          mesh.position.x = Math.cos(angle) * radius;
          mesh.position.z = Math.sin(angle) * radius;
          mesh.position.y = 0;
          
          // Make it face the camera
          mesh.lookAt(camera.position);
          
          // Add glow effect
          const glowGeometry = new THREE.PlaneGeometry(2, 2);
          const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0x3b82f6,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
          });
          const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
          glowMesh.position.copy(mesh.position);
          glowMesh.position.z -= 0.01; // Slightly behind the icon
          
          // Animation data
          mesh.userData = {
            rotationSpeed: {
              y: 0.01,
            },
            floatSpeed: 0.005 + (index * 0.002),
            floatAmplitude: 1,
            initialY: mesh.position.y,
            orbitSpeed: 0.001 + (index * 0.0005),
            orbitRadius: radius,
            orbitAngle: angle,
            pulseSpeed: 0.01 + (index * 0.005),
            pulseAmplitude: 0.2,
            initialScale: 1,
          };
          
          glowMesh.userData = mesh.userData; // Share animation data
          
          meshes.push(mesh);
          meshes.push(glowMesh);
          scene.add(mesh);
          scene.add(glowMesh);
        });
      });
    } else {
      // Fallback: Create a generic loading animation with geometric shapes
      const geometries = [
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.SphereGeometry(0.7, 32, 32),
        new THREE.ConeGeometry(0.7, 1.5, 8),
        new THREE.TorusGeometry(0.5, 0.2, 16, 100),
      ];

      const materials = [
        new THREE.MeshBasicMaterial({ color: 0x3b82f6, wireframe: true }),
        new THREE.MeshBasicMaterial({ color: 0x10b981, wireframe: true }),
        new THREE.MeshBasicMaterial({ color: 0xf59e0b, wireframe: true }),
        new THREE.MeshBasicMaterial({ color: 0xef4444, wireframe: true }),
      ];

      for (let i = 0; i < 4; i++) {
        const geometry = geometries[i];
        const material = materials[i];
        const mesh = new THREE.Mesh(geometry, material);
        
        const angle = (i / 4) * Math.PI * 2;
        const radius = 3;
        mesh.position.x = Math.cos(angle) * radius;
        mesh.position.z = Math.sin(angle) * radius;
        mesh.position.y = 0;
        
        mesh.userData = {
          rotationSpeed: {
            x: (Math.random() - 0.5) * 0.02,
            y: (Math.random() - 0.5) * 0.02,
            z: (Math.random() - 0.5) * 0.02,
          },
          floatSpeed: Math.random() * 0.01 + 0.005,
          floatAmplitude: Math.random() * 2 + 1,
          initialY: mesh.position.y,
          orbitSpeed: 0.001,
          orbitRadius: radius,
          orbitAngle: angle,
          pulseSpeed: 0.01,
          pulseAmplitude: 0.2,
          initialScale: 1,
        };
        
        meshes.push(mesh);
        scene.add(mesh);
      }
    }

    // Add floating particles around the icons
    const particleCount = 50;
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    
    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
      color: 0x3b82f6,
      size: 0.1,
      transparent: true,
      opacity: 0.6
    });
    
    const particleSystem = new THREE.Points(particles, particleMaterial);
    scene.add(particleSystem);

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Position camera
    camera.position.z = 8;
    camera.position.y = 2;

    // Animation loop
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      // Animate model icon meshes
      meshes.forEach((mesh) => {
        if (!mesh.userData) return;

        const data = mesh.userData;
        
        // Orbital motion around center
        data.orbitAngle += data.orbitSpeed;
        mesh.position.x = Math.cos(data.orbitAngle) * data.orbitRadius;
        mesh.position.z = Math.sin(data.orbitAngle) * data.orbitRadius;
        
        // Floating motion
        mesh.position.y = data.initialY + 
          Math.sin(time * data.floatSpeed) * data.floatAmplitude;

        // Gentle rotation
        mesh.rotation.y += data.rotationSpeed.y;

        // Pulsing scale effect
        const pulse = 1 + Math.sin(time * data.pulseSpeed) * data.pulseAmplitude;
        mesh.scale.setScalar(pulse);

        // Make icons always face the camera
        mesh.lookAt(camera.position);
      });

      // Animate particles
      const particlePositions = particleSystem.geometry.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        particlePositions[i3 + 1] += Math.sin(time + i) * 0.01; // Float up and down
        particlePositions[i3] += Math.cos(time * 0.5 + i) * 0.005; // Gentle drift
      }
      particleSystem.geometry.attributes.position.needsUpdate = true;

      // Dynamic camera movement
      camera.position.x = Math.sin(time * 0.2) * 2;
      camera.position.y = Math.sin(time * 0.15) * 1 + 2;
      camera.position.z = 8 + Math.sin(time * 0.1) * 1;
      camera.lookAt(0, 0, 0);

      // Rotate particle system
      particleSystem.rotation.y += 0.002;

      renderer.render(scene, camera);
    };

    animate();
    sceneRef.current = { scene, camera, renderer, meshes };
  };

  const handleCancelRequest = async (request: QueueRequest) => {
    try {
      await onCancelRequest(request.requestId, request.model);
    } catch (error) {
      console.error('Failed to cancel request:', error);
    }
  };

  if (!isOpen || activeRequests.length === 0) {
    return null;
  }

  return (
    <div className="w-full h-full">
      <div className="bg-white rounded-xl shadow-lg w-full h-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
              <div>
                <h2 className="text-xl font-semibold">Generating Content</h2>
                <p className="text-blue-100 text-sm">
                  {activeRequests.length} request{activeRequests.length > 1 ? 's' : ''} in progress
                </p>
              </div>
            </div>
            <button
              onClick={() => {/* Handle close */}}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* 3D Animation Area */}
        <div className="p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* 3D Animation */}
            <div className="flex-1">
              <div className="bg-gray-900 rounded-lg p-4 flex items-center justify-center min-h-[300px]">
                {isThreeJSLoaded ? (
                  <div ref={mountRef} className="w-full h-full flex items-center justify-center" />
                ) : (
                  <div className="text-white text-center">
                    <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p>Loading 3D Engine...</p>
                  </div>
                )}
              </div>
            </div>

            {/* Request Details */}
            <div className="flex-1 space-y-4">
              {activeRequests.map((request) => (
                <div
                  key={request.id}
                  className="border rounded-lg p-4 bg-gray-50"
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="relative w-8 h-8 flex-shrink-0">
                      <Image
                        src={getModelIcon(request.model)}
                        alt={`${formatModelName(request.model)} icon`}
                        fill
                        className="object-contain"
                        sizes="32px"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">
                          {formatModelName(request.model)}
                        </span>
                        {request.status === 'IN_QUEUE' && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full mr-1 animate-pulse"></div>
                            Queued
                          </span>
                        )}
                        {request.status === 'IN_PROGRESS' && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mr-1 animate-pulse"></div>
                            Processing
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {request.prompt}
                      </p>
                    </div>
                    {request.status === 'IN_QUEUE' && (
                      <button
                        onClick={() => handleCancelRequest(request)}
                        className="text-red-600 hover:text-red-700 text-xs px-2 py-1 border border-red-300 rounded hover:bg-red-50 transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>

                  {request.queuePosition !== undefined && (
                    <p className="text-xs text-gray-500">
                      Position in queue: #{request.queuePosition + 1}
                    </p>
                  )}

                  {/* Logs */}
                  {request.logs && request.logs.length > 0 && (
                    <div className="mt-3">
                      <div className="text-xs text-gray-500 mb-1">Latest Log:</div>
                      <div className="text-xs bg-white p-2 rounded border max-h-16 overflow-y-auto">
                        {request.logs[request.logs.length - 1]?.message}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Content will appear in the center panel when ready
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
