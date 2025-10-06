import toast from 'react-hot-toast';
import { COLORS } from '../constants/constants';
import { CloseIcon } from '@/icons/icons';
import Button from '@/components/form/button';

export function showToast(text: string, type: boolean) {
  const toastId = toast(text, {
    duration: 1000,
    position: 'bottom-center',
    style: {
      backgroundColor: type ? COLORS.primary : COLORS.redprimary,
      fontSize: 13,
      color: 'white',
      fontWeight: '600'
    },
    icon: <Button onClick={() => toast.dismiss(toastId)}><CloseIcon className='size-4 text-white' /></Button>
  });
}