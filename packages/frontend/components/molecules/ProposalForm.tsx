'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin } from 'lucide-react';

const proposalSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title must be less than 100 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters').max(5000, 'Description must be less than 5000 characters'),
  category: z.string().min(1, 'Please select a category'),
  tags: z.array(z.string()).min(1, 'Add at least one tag').max(5, 'Maximum 5 tags allowed'),
  latitude: z.coerce.number().min(-90).max(90).optional().or(z.literal('')),
  longitude: z.coerce.number().min(-180).max(180).optional().or(z.literal('')),
});


type ProposalFormValues = z.infer<typeof proposalSchema>;

const CATEGORIES = [
  { value: 'infrastructure', label: 'Infrastructure' },
  { value: 'environment', label: 'Environment' },
  { value: 'safety', label: 'Public Safety' },
  { value: 'transportation', label: 'Transportation' },
  { value: 'community', label: 'Community' },
  { value: 'other', label: 'Other' },
];

interface ProposalFormProps {
  onSubmit: (data: ProposalFormValues) => Promise<void>;
  isLoading?: boolean;
}

export function ProposalForm({ onSubmit, isLoading }: ProposalFormProps) {
  const [step, setStep] = useState(1);
  const [tagInput, setTagInput] = useState('');

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<ProposalFormValues>({
    resolver: zodResolver(proposalSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      tags: [],
      latitude: '',
      longitude: '',
    },
  });

  const tags = watch('tags');

  const handleNext = async () => {
    const fieldsToValidate: (keyof ProposalFormValues)[] = step === 1 ? ['title', 'description'] : ['category', 'tags'];
    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    setStep((s) => s - 1);
  };

  const handleAddTag = () => {
    const trimmed = tagInput.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed) && tags.length < 5) {
      setValue('tags', [...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setValue('tags', tags.filter((t) => t !== tagToRemove));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm ${step >= 1 ? 'bg-primary text-white' : 'bg-surface-container-high text-on-surface-variant'}`}>1</div>
          <div className={`w-16 h-1 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-outline'}`} />
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm ${step >= 2 ? 'bg-primary text-white' : 'bg-surface-container-high text-on-surface-variant'}`}>2</div>
        </div>
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <Input
            {...register('title')}
            label="Proposal Title"
            placeholder="Enter a clear, descriptive title"
            error={errors.title?.message}
          />
          <div className="space-y-2">
            <Label htmlFor="description" className="text-on-surface">Description</Label>
            <textarea
              {...register('description')}
              id="description"
              rows={6}
              placeholder="Describe your proposal in detail..."
              className="flex w-full rounded-xl border border-outline bg-surface-base p-4 text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 resize-none"
            />
            {errors.description && <p className="text-sm text-error">{errors.description.message}</p>}
          </div>
          <div className="flex justify-end">
            <Button type="button" onClick={handleNext} className="rounded-full">Next</Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <div className="space-y-2">
                <Label htmlFor="category" className="text-on-surface">Category</Label>
                <select
                  {...field}
                  id="category"
                  className="flex h-12 w-full rounded-xl border border-outline bg-surface-base px-4 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                >
                  <option value="">Select a category</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
                {errors.category && <p className="text-sm text-error">{errors.category.message}</p>}
              </div>
            )}
          />
          <div className="space-y-2">
            <Label className="text-on-surface flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              Location (optional)
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <Input
                {...register('latitude')}
                type="number"
                step="any"
                placeholder="Latitude"
              />
              <Input
                {...register('longitude')}
                type="number"
                step="any"
                placeholder="Longitude"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-on-surface">Tags</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add a tag"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              />
              <Button type="button" variant="outline" onClick={handleAddTag} className="rounded-full">Add</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span key={tag} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-container text-on-primary-container">
                  {tag}
                  <button type="button" onClick={() => handleRemoveTag(tag)} className="ml-1.5 text-on-primary-container hover:opacity-70">×</button>
                </span>
              ))}
            </div>
            {errors.tags && <p className="text-sm text-error">{errors.tags.message}</p>}
          </div>
          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={handleBack} className="rounded-full">Back</Button>
            <Button type="submit" disabled={isLoading} className="rounded-full">
              {isLoading ? 'Submitting...' : 'Submit Proposal'}
            </Button>
          </div>
        </div>
      )}
    </form>
  );
}