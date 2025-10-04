/**
 * استيرادات محسنة للأداء
 * يوفر استيرادات محددة بدلاً من المكتبات الكاملة
 */

// استيرادات محسنة لـ Lucide React
export {
    AlertCircle, AlertTriangle, ArrowDown, ArrowLeft,
    ArrowRight,
    ArrowUp, Bookmark, Calendar, Check, CheckCircle, ChevronDown, ChevronLeft,
    ChevronRight,
    ChevronUp, Clock, Close, Copy, Download, Edit, Eye,
    EyeOff, Filter, Flag, Heart, HelpCircle, Info, Loader2, Mail, Menu, Minus, MoreHorizontal,
    MoreVertical, Phone, Plus, Save, Search, Settings, Share, Star, Trash2, Upload, User, X, XCircle
} from 'lucide-react';

// استيرادات محسنة لـ Radix UI
export { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
export { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
export { Badge } from '@/components/ui/badge';
export { Button } from '@/components/ui/button';
export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
export { Checkbox } from '@/components/ui/checkbox';
export { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
export { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
export { Input } from '@/components/ui/input';
export { Label } from '@/components/ui/label';
export { Progress } from '@/components/ui/progress';
export { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
export { Separator } from '@/components/ui/separator';
export { Skeleton } from '@/components/ui/skeleton';
export { Slider } from '@/components/ui/slider';
export { Switch } from '@/components/ui/switch';
export { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
export { Textarea } from '@/components/ui/textarea';
export { Toast, ToastAction, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from '@/components/ui/toast';
export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
export { useToast } from '@/hooks/use-toast';

// استيرادات محسنة للأدوات المساعدة
export { cn } from '@/lib/utils';
export { format } from 'date-fns';
export { toast } from 'sonner';

// استيرادات محسنة للـ React
export { createContext, forwardRef, lazy, memo, Suspense, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

// استيرادات محسنة لـ Next.js
export { Image } from 'next/image';
export { Link } from 'next/link';
export { usePathname, useRouter, useSearchParams } from 'next/navigation';

// استيرادات محسنة لـ React Query
export { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// استيرادات محسنة لـ Zustand
export { create } from 'zustand';

// استيرادات محسنة لـ React Hook Form
export { zodResolver } from '@hookform/resolvers/zod';
export { Controller, useForm } from 'react-hook-form';

// استيرادات محسنة لـ Zod
export { z } from 'zod';

// استيرادات محسنة لـ Firebase
export {
    createUserWithEmailAndPassword, onAuthStateChanged, sendPasswordResetEmail, signInWithEmailAndPassword, signOut, updateProfile
} from 'firebase/auth';
export {
    addDoc, collection, deleteDoc, doc,
    getDoc, getDocs, limit,
    onSnapshot, orderBy, query, setDoc,
    updateDoc, where
} from 'firebase/firestore';
export {
    deleteObject, getDownloadURL, ref,
    uploadBytes
} from 'firebase/storage';

export default {};
