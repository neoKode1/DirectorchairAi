import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

interface TextInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  description?: string;
}

export function TextInput({ label, value, onChange, placeholder, description }: TextInputProps) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {description && <p className="text-xs text-gray-500">{description}</p>}
    </div>
  );
}

interface TextAreaInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  description?: string;
}

export function TextAreaInput({ label, value, onChange, placeholder, description }: TextAreaInputProps) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {description && <p className="text-xs text-gray-500">{description}</p>}
    </div>
  );
}

interface SelectInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  description?: string;
}

export function SelectInput({ label, value, onChange, options, description }: SelectInputProps) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {description && <p className="text-xs text-gray-500">{description}</p>}
    </div>
  );
}

interface FileUploadProps {
  label: string;
  onFileSelect: (file: File) => void;
  accept?: string;
  description?: string;
}

export function FileUpload({ label, onFileSelect, accept, description }: FileUploadProps) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input
        type="file"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            onFileSelect(file);
          }
        }}
        accept={accept}
      />
      {description && <p className="text-xs text-gray-500">{description}</p>}
    </div>
  );
} 