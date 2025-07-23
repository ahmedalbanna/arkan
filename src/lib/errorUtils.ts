import { toast } from "@/hooks/use-toast";

export const handleErrorUtility = (error: any, context?: string) => {
  let title = 'Error';
  let description = 'An unexpected error occurred. Please try again.';

  if (error && error.message) {
    description = error.message;
  } else if (error && error.error && error.error._form && error.error._form[0]) {
    description = error.error._form[0];
  } else if (typeof error === 'string') {
    description = error;
  }

  if (context) {
    title = context;
  }

  toast({
    title,
    description,
    variant: 'destructive',
  });
};
