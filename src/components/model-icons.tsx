"use client";

import Image from "next/image";
import { useState } from "react";

interface ModelIconProps {
  model: string;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
  onClick?: () => void;
}

interface ModelIconData {
  name: string;
  icon: string;
  color: string; // Hex color code
  description: string;
}

const MODEL_ICONS: Record<string, ModelIconData> = {
  "flux": {
    name: "Flux",
    icon: "/flux.svg",
    color: "#FF6B35", // Orange
    description: "Professional image generation"
  },
  "veo3": {
    name: "Veo3",
    icon: "/gemini-color.svg",
    color: "#4285F4", // Google Blue
    description: "Google's latest video generation"
  },
  "kling": {
    name: "Kling",
    icon: "/kling-color.svg",
    color: "#00BCD4", // Cyan
    description: "Advanced video generation"
  },
  "luma": {
    name: "Luma",
    icon: "/dreammachine.png",
    color: "#9C27B0", // Purple
    description: "Natural motion video"
  },
  "minimax": {
    name: "Minimax",
    icon: "/minimax-color.svg",
    color: "#E91E63", // Pink
    description: "Enhanced motion & smoothness"
  },
  "seedance": {
    name: "Seedance",
    icon: "/bytedance-color.svg",
    color: "#009688", // Teal
    description: "Multiple angle variations"
  },
  "ideogram": {
    name: "Ideogram",
    icon: "/ideogram.svg",
    color: "#FF5722", // Deep Orange
    description: "Character consistency"
  },
  "elevenlabs": {
    name: "ElevenLabs",
    icon: "/elevenlabs.svg",
    color: "#3F51B5", // Indigo
    description: "High-quality text-to-speech"
  },
  "fal": {
    name: "FAL",
    icon: "/fal-color.svg",
    color: "#2196F3", // Blue
    description: "AI model platform"
  },
  "claude": {
    name: "Claude",
    icon: "/claude-color.svg",
    color: "#FF9800", // Orange
    description: "AI assistant"
  },
  "openai": {
    name: "OpenAI",
    icon: "/openai-color.svg",
    color: "#10A37F", // Green
    description: "AI research"
  },
  "anthropic": {
    name: "Anthropic",
    icon: "/anthropic-color.svg",
    color: "#FF6B35", // Orange
    description: "AI safety research"
  },
  "google": {
    name: "Google",
    icon: "/google-color.svg",
    color: "#4285F4", // Google Blue
    description: "AI and machine learning"
  },
  "microsoft": {
    name: "Microsoft",
    icon: "/microsoft-color.svg",
    color: "#00A4EF", // Microsoft Blue
    description: "AI and cloud services"
  },
  "meta": {
    name: "Meta",
    icon: "/meta-color.svg",
    color: "#1877F2", // Facebook Blue
    description: "AI research"
  },
  "amazon": {
    name: "Amazon",
    icon: "/amazon-color.svg",
    color: "#FF9900", // Amazon Orange
    description: "AWS AI services"
  },
  "nvidia": {
    name: "NVIDIA",
    icon: "/nvidia-color.svg",
    color: "#76B900", // NVIDIA Green
    description: "AI computing"
  },
  "intel": {
    name: "Intel",
    icon: "/intel-color.svg",
    color: "#0071C5", // Intel Blue
    description: "AI processors"
  },
  "amd": {
    name: "AMD",
    icon: "/amd-color.svg",
    color: "#ED1C24", // AMD Red
    description: "AI computing"
  },
  "apple": {
    name: "Apple",
    icon: "/apple-color.svg",
    color: "#000000", // Apple Black
    description: "AI integration"
  },
  "tesla": {
    name: "Tesla",
    icon: "/tesla-color.svg",
    color: "#CC0000", // Tesla Red
    description: "AI and autonomous driving"
  },
  "spacex": {
    name: "SpaceX",
    icon: "/spacex-color.svg",
    color: "#005288", // SpaceX Blue
    description: "Space technology"
  },
  "netflix": {
    name: "Netflix",
    icon: "/netflix-color.svg",
    color: "#E50914", // Netflix Red
    description: "Content recommendation"
  },
  "spotify": {
    name: "Spotify",
    icon: "/spotify-color.svg",
    color: "#1DB954", // Spotify Green
    description: "Music AI"
  },
  "uber": {
    name: "Uber",
    icon: "/uber-color.svg",
    color: "#000000", // Uber Black
    description: "AI logistics"
  },
  "airbnb": {
    name: "Airbnb",
    icon: "/airbnb-color.svg",
    color: "#FF5A5F", // Airbnb Red
    description: "AI recommendations"
  },
  "linkedin": {
    name: "LinkedIn",
    icon: "/linkedin-color.svg",
    color: "#0077B5", // LinkedIn Blue
    description: "Professional AI"
  },
  "twitter": {
    name: "Twitter",
    icon: "/twitter-color.svg",
    color: "#1DA1F2", // Twitter Blue
    description: "Social AI"
  },
  "instagram": {
    name: "Instagram",
    icon: "/instagram-color.svg",
    color: "#E4405F", // Instagram Pink
    description: "Visual AI"
  },
  "tiktok": {
    name: "TikTok",
    icon: "/tiktok-color.svg",
    color: "#000000", // TikTok Black
    description: "Short-form AI"
  },
  "youtube": {
    name: "YouTube",
    icon: "/youtube-color.svg",
    color: "#FF0000", // YouTube Red
    description: "Video AI"
  },
  "discord": {
    name: "Discord",
    icon: "/discord-color.svg",
    color: "#5865F2", // Discord Blue
    description: "Communication AI"
  },
  "slack": {
    name: "Slack",
    icon: "/slack-color.svg",
    color: "#4A154B", // Slack Purple
    description: "Workplace AI"
  },
  "zoom": {
    name: "Zoom",
    icon: "/zoom-color.svg",
    color: "#2D8CFF", // Zoom Blue
    description: "Video conferencing AI"
  },
  "github": {
    name: "GitHub",
    icon: "/github-color.svg",
    color: "#181717", // GitHub Black
    description: "Code AI"
  },
  "gitlab": {
    name: "GitLab",
    icon: "/gitlab-color.svg",
    color: "#FCA326", // GitLab Orange
    description: "DevOps AI"
  },
  "bitbucket": {
    name: "Bitbucket",
    icon: "/bitbucket-color.svg",
    color: "#0052CC", // Bitbucket Blue
    description: "Code collaboration AI"
  },
  "docker": {
    name: "Docker",
    icon: "/docker-color.svg",
    color: "#2496ED", // Docker Blue
    description: "Container AI"
  },
  "kubernetes": {
    name: "Kubernetes",
    icon: "/kubernetes-color.svg",
    color: "#326CE5", // Kubernetes Blue
    description: "Orchestration AI"
  },
  "aws": {
    name: "AWS",
    icon: "/aws-color.svg",
    color: "#FF9900", // AWS Orange
    description: "Cloud AI services"
  },
  "azure": {
    name: "Azure",
    icon: "/azure-color.svg",
    color: "#0089D6", // Azure Blue
    description: "Microsoft cloud AI"
  },
  "gcp": {
    name: "Google Cloud",
    icon: "/gcp-color.svg",
    color: "#4285F4", // Google Blue
    description: "Google cloud AI"
  },
  "ibm": {
    name: "IBM",
    icon: "/ibm-color.svg",
    color: "#006699", // IBM Blue
    description: "Enterprise AI"
  },
  "oracle": {
    name: "Oracle",
    icon: "/oracle-color.svg",
    color: "#F80000", // Oracle Red
    description: "Database AI"
  },
  "salesforce": {
    name: "Salesforce",
    icon: "/salesforce-color.svg",
    color: "#00A1E0", // Salesforce Blue
    description: "CRM AI"
  },
  "adobe": {
    name: "Adobe",
    icon: "/adobe-color.svg",
    color: "#FF0000", // Adobe Red
    description: "Creative AI"
  },
  "autodesk": {
    name: "Autodesk",
    icon: "/autodesk-color.svg",
    color: "#0696D7", // Autodesk Blue
    description: "Design AI"
  },
  "unity": {
    name: "Unity",
    icon: "/unity-color.svg",
    color: "#000000", // Unity Black
    description: "Game development AI"
  },
  "unreal": {
    name: "Unreal",
    icon: "/unreal-color.svg",
    color: "#0E0E0E", // Unreal Black
    description: "Game engine AI"
  },
  "blender": {
    name: "Blender",
    icon: "/blender-color.svg",
    color: "#F5792A", // Blender Orange
    description: "3D creation AI"
  },
  "maya": {
    name: "Maya",
    icon: "/maya-color.svg",
    color: "#00A1E0", // Maya Blue
    description: "3D animation AI"
  },
  "houdini": {
    name: "Houdini",
    icon: "/houdini-color.svg",
    color: "#FF6B35", // Houdini Orange
    description: "VFX AI"
  },
  "nuke": {
    name: "Nuke",
    icon: "/nuke-color.svg",
    color: "#000000", // Nuke Black
    description: "Compositing AI"
  },
  "davinci": {
    name: "DaVinci Resolve",
    icon: "/davinci-color.svg",
    color: "#000000", // DaVinci Black
    description: "Video editing AI"
  },
  "premiere": {
    name: "Premiere Pro",
    icon: "/premiere-color.svg",
    color: "#EA4335", // Premiere Red
    description: "Video editing AI"
  },
  "aftereffects": {
    name: "After Effects",
    icon: "/aftereffects-color.svg",
    color: "#8E63CE", // After Effects Purple
    description: "Motion graphics AI"
  },
  "photoshop": {
    name: "Photoshop",
    icon: "/photoshop-color.svg",
    color: "#31A8FF", // Photoshop Blue
    description: "Image editing AI"
  },
  "illustrator": {
    name: "Illustrator",
    icon: "/illustrator-color.svg",
    color: "#FF9A00", // Illustrator Orange
    description: "Vector graphics AI"
  },
  "indesign": {
    name: "InDesign",
    icon: "/indesign-color.svg",
    color: "#FF3366", // InDesign Pink
    description: "Layout AI"
  },
  "figma": {
    name: "Figma",
    icon: "/figma-color.svg",
    color: "#F24E1E", // Figma Orange
    description: "Design collaboration AI"
  },
  "sketch": {
    name: "Sketch",
    icon: "/sketch-color.svg",
    color: "#FFD700", // Sketch Gold
    description: "Design AI"
  },
  "invision": {
    name: "InVision",
    icon: "/invision-color.svg",
    color: "#FF3366", // InVision Pink
    description: "Prototyping AI"
  },
  "zeplin": {
    name: "Zeplin",
    icon: "/zeplin-color.svg",
    color: "#FDBD39", // Zeplin Yellow
    description: "Design handoff AI"
  },
  "notion": {
    name: "Notion",
    icon: "/notion-color.svg",
    color: "#000000", // Notion Black
    description: "Productivity AI"
  },
  "trello": {
    name: "Trello",
    icon: "/trello-color.svg",
    color: "#0079BF", // Trello Blue
    description: "Project management AI"
  },
  "asana": {
    name: "Asana",
    icon: "/asana-color.svg",
    color: "#F06A6A", // Asana Pink
    description: "Work management AI"
  },
  "jira": {
    name: "Jira",
    icon: "/jira-color.svg",
    color: "#0052CC", // Jira Blue
    description: "Issue tracking AI"
  },
  "confluence": {
    name: "Confluence",
    icon: "/confluence-color.svg",
    color: "#172B4D", // Confluence Dark Blue
    description: "Documentation AI"
  },
  "monday": {
    name: "Monday.com",
    icon: "/monday-color.svg",
    color: "#00C875", // Monday Green
    description: "Work OS AI"
  },
  "clickup": {
    name: "ClickUp",
    icon: "/clickup-color.svg",
    color: "#7B68EE", // ClickUp Purple
    description: "Productivity AI"
  },
  "linear": {
    name: "Linear",
    icon: "/linear-color.svg",
    color: "#5E6AD2", // Linear Purple
    description: "Issue tracking AI"
  },
  "basecamp": {
    name: "Basecamp",
    icon: "/basecamp-color.svg",
    color: "#1D2D35", // Basecamp Dark
    description: "Project management AI"
  },
  "teams": {
    name: "Microsoft Teams",
    icon: "/teams-color.svg",
    color: "#6264A7", // Teams Purple
    description: "Collaboration AI"
  },
  "webex": {
    name: "Cisco Webex",
    icon: "/webex-color.svg",
    color: "#049FD9", // Webex Blue
    description: "Video conferencing AI"
  },
  "gotomeeting": {
    name: "GoToMeeting",
    icon: "/gotomeeting-color.svg",
    color: "#FF6600", // GoToMeeting Orange
    description: "Online meetings AI"
  },
  "bluejeans": {
    name: "BlueJeans",
    icon: "/bluejeans-color.svg",
    color: "#0066CC", // BlueJeans Blue
    description: "Video conferencing AI"
  },
  "ringcentral": {
    name: "RingCentral",
    icon: "/ringcentral-color.svg",
    color: "#0073E6", // RingCentral Blue
    description: "Communication AI"
  },
  "8x8": {
    name: "8x8",
    icon: "/8x8-color.svg",
    color: "#000000", // 8x8 Black
    description: "Communication AI"
  },
  "vonage": {
    name: "Vonage",
    icon: "/vonage-color.svg",
    color: "#FF6600", // Vonage Orange
    description: "Communication AI"
  },
  "twilio": {
    name: "Twilio",
    icon: "/twilio-color.svg",
    color: "#F22F46", // Twilio Red
    description: "Communication API AI"
  },
  "sendgrid": {
    name: "SendGrid",
    icon: "/sendgrid-color.svg",
    color: "#1A73E8", // SendGrid Blue
    description: "Email AI"
  },
  "mailchimp": {
    name: "Mailchimp",
    icon: "/mailchimp-color.svg",
    color: "#FFE01B", // Mailchimp Yellow
    description: "Email marketing AI"
  },
  "constantcontact": {
    name: "Constant Contact",
    icon: "/constantcontact-color.svg",
    color: "#FF6600", // Constant Contact Orange
    description: "Email marketing AI"
  },
  "hubspot": {
    name: "HubSpot",
    icon: "/hubspot-color.svg",
    color: "#FF7A59", // HubSpot Orange
    description: "Marketing AI"
  },
  "marketo": {
    name: "Marketo",
    icon: "/marketo-color.svg",
    color: "#5C4C9F", // Marketo Purple
    description: "Marketing automation AI"
  },
  "pardot": {
    name: "Pardot",
    icon: "/pardot-color.svg",
    color: "#FF6600", // Pardot Orange
    description: "Marketing automation AI"
  },
  "eloqua": {
    name: "Eloqua",
    icon: "/eloqua-color.svg",
    color: "#FF6600", // Eloqua Orange
    description: "Marketing automation AI"
  },
  "activecampaign": {
    name: "ActiveCampaign",
    icon: "/activecampaign-color.svg",
    color: "#FF6600", // ActiveCampaign Orange
    description: "Marketing automation AI"
  },
  "drip": {
    name: "Drip",
    icon: "/drip-color.svg",
    color: "#FF6600", // Drip Orange
    description: "E-commerce marketing AI"
  },
  "klaviyo": {
    name: "Klaviyo",
    icon: "/klaviyo-color.svg",
    color: "#FF6600", // Klaviyo Orange
    description: "E-commerce marketing AI"
  },
  "shopify": {
    name: "Shopify",
    icon: "/shopify-color.svg",
    color: "#95BF47", // Shopify Green
    description: "E-commerce AI"
  },
  "woocommerce": {
    name: "WooCommerce",
    icon: "/woocommerce-color.svg",
    color: "#96588A", // WooCommerce Purple
    description: "E-commerce AI"
  },
  "magento": {
    name: "Magento",
    icon: "/magento-color.svg",
    color: "#F46F25", // Magento Orange
    description: "E-commerce AI"
  },
  "bigcommerce": {
    name: "BigCommerce",
    icon: "/bigcommerce-color.svg",
    color: "#34313F", // BigCommerce Dark
    description: "E-commerce AI"
  },
  "squarespace": {
    name: "Squarespace",
    icon: "/squarespace-color.svg",
    color: "#000000", // Squarespace Black
    description: "Website builder AI"
  },
  "wix": {
    name: "Wix",
    icon: "/wix-color.svg",
    color: "#FF6600", // Wix Orange
    description: "Website builder AI"
  },
  "webflow": {
    name: "Webflow",
    icon: "/webflow-color.svg",
    color: "#4353FF", // Webflow Blue
    description: "Website builder AI"
  },
  "wordpress": {
    name: "WordPress",
    icon: "/wordpress-color.svg",
    color: "#21759B", // WordPress Blue
    description: "CMS AI"
  },
  "drupal": {
    name: "Drupal",
    icon: "/drupal-color.svg",
    color: "#0678BE", // Drupal Blue
    description: "CMS AI"
  },
  "joomla": {
    name: "Joomla",
    icon: "/joomla-color.svg",
    color: "#F44321", // Joomla Orange
    description: "CMS AI"
  },
  "ghost": {
    name: "Ghost",
    icon: "/ghost-color.svg",
    color: "#15171A", // Ghost Dark
    description: "Publishing platform AI"
  }
};

const SIZE_CLASSES = {
  sm: "w-6 h-6",
  md: "w-8 h-8",
  lg: "w-12 h-12"
};

export function ModelIcon({ model, size = "md", showLabel = false, className = "", onClick }: ModelIconProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  // Find the matching model icon data
  const modelKey = Object.keys(MODEL_ICONS).find(key => 
    model.toLowerCase().includes(key.toLowerCase())
  );
  
  const iconData = modelKey ? MODEL_ICONS[modelKey] : null;
  
  if (!iconData) {
    return (
      <div className={`${SIZE_CLASSES[size]} rounded-lg bg-gray-500 flex items-center justify-center ${className}`}>
        <span className="text-white text-xs font-bold">AI</span>
      </div>
    );
  }

  return (
    <div
      className={`relative group ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <div 
        className={`${SIZE_CLASSES[size]} relative rounded-lg p-1 shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl`}
        style={{ backgroundColor: iconData.color }}
      >
        <Image
          src={iconData.icon}
          alt={iconData.name}
          width={size === "sm" ? 24 : size === "md" ? 32 : 48}
          height={size === "sm" ? 24 : size === "md" ? 32 : 48}
          className="w-full h-full object-contain"
        />
      </div>
      
      {/* Tooltip */}
      {isHovered && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black/90 text-white text-sm rounded-lg shadow-lg z-50 whitespace-nowrap">
          <div className="font-semibold">{iconData.name}</div>
          <div className="text-xs text-gray-300">{iconData.description}</div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/90"></div>
        </div>
      )}
      
      {showLabel && (
        <div className="mt-1 text-center">
          <span className="text-xs font-medium text-foreground">{iconData.name}</span>
        </div>
      )}
    </div>
  );
}

export function ModelIconsGrid({ models, size = "md", showLabels = false, className = "" }: {
  models: string[];
  size?: "sm" | "md" | "lg";
  showLabels?: boolean;
  className?: string;
}) {
  return (
    <div className={`grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 ${className}`}>
      {models.map((model, index) => (
        <ModelIcon
          key={`${model}-${index}`}
          model={model}
          size={size}
          showLabel={showLabels}
        />
      ))}
    </div>
  );
}

export function ModelIconsCarousel({ models, size = "md", showLabels = false, className = "" }: {
  models: string[];
  size?: "sm" | "md" | "lg";
  showLabels?: boolean;
  className?: string;
}) {
  return (
    <div className={`flex gap-3 overflow-x-auto pb-2 ${className}`}>
      {models.map((model, index) => (
        <div key={`${model}-${index}`} className="flex-shrink-0">
          <ModelIcon
            model={model}
            size={size}
            showLabel={showLabels}
          />
        </div>
      ))}
    </div>
  );
}

export function AvailableModelsShowcase({ className = "" }: { className?: string }) {
  // Only show models that are actually featured in the application
  const featuredModels = [
    "flux",           // FLUX Pro models
    "veo3",           // Google Veo3
    "kling",          // Kling video models
    "luma",           // Luma Ray 2 models
    "minimax",        // Minimax Hailuo 02
    "seedance",       // Seedance 1.0 Pro
    "ideogram",       // Ideogram Character
    "elevenlabs"      // ElevenLabs TTS
  ];
  
  const isDarkTheme = className.includes("text-white");
  
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="text-center">
        <h3 className="mobile-text-xl sm:text-2xl font-black text-foreground mb-2 drop-shadow-lg">
          Available AI Models
        </h3>
        <p className={`${isDarkTheme ? 'text-cyan-100' : 'text-muted-foreground'} drop-shadow-sm mobile-text-sm sm:text-base`}>
          Professional-grade AI models for all your creative needs
        </p>
      </div>
      
      <ModelIconsGrid
        models={featuredModels}
        size="lg"
        showLabels={true}
        className="max-w-4xl mx-auto mobile-model-icons"
      />
      
      <div className="mobile-grid-2 lg:grid-cols-4 mobile-gap mt-6 sm:mt-8">
        {featuredModels.map((model) => {
          const iconData = MODEL_ICONS[model];
          return (
                         <div
               key={model}
               className={`mobile-card-sm rounded-lg ${isDarkTheme 
                 ? 'bg-black/20 backdrop-blur-sm border border-cyan-500/30 hover:border-cyan-400/50' 
                 : 'bg-background/20 backdrop-blur-sm border border-border/30 hover:border-border/50'
               } transition-colors`}
             >
               <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                 <ModelIcon model={model} size="md" />
                 <h4 className={`font-semibold mobile-text-sm sm:text-base ${isDarkTheme ? 'text-white' : 'text-foreground'}`}>
                   {iconData.name}
                 </h4>
               </div>
               <p className={`mobile-text-xs sm:text-sm ${isDarkTheme ? 'text-cyan-100' : 'text-muted-foreground'}`}>
                 {iconData.description}
               </p>
             </div>
          );
        })}
      </div>
    </div>
  );
}
