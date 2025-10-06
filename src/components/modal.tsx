import { useEffect, useRef, useState } from "react";
import Button from '@/components/form/button';
import { CloseIcon } from '@/icons/icons';
import { twMerge } from "tailwind-merge";

interface Props {
  onClose: () => void;
  onClickSave?: () => void;
  name: string;
  children: React.ReactNode;
  classNameModal?: string;
  onClickDelete?: () => void;
  principalButtonName?: string;
  showDeleteButton?: boolean;
  deleteButtonLabel?: string;
  className?: string;
}

export default function Modal({
  onClose,
  name,
  onClickSave,
  children,
  classNameModal,
  principalButtonName = 'Listo',
  showDeleteButton = false,
  deleteButtonLabel = 'Eliminar',
  onClickDelete,
  className
}: Props) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isScrolledToEnd, setIsScrolledToEnd] = useState(true);
  const mainRef = useRef<HTMLDivElement | null>(null);

  const handleScroll = () => {
    if (mainRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = mainRef.current;
      setIsScrolled(scrollTop > 0);
      setIsScrolledToEnd(scrollTop + clientHeight >= scrollHeight);
    }
  };

  useEffect(() => {
    const mainElement = mainRef.current;
    if (mainElement) {
      mainElement.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (mainElement) {
        mainElement.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  useEffect(() => {
    function handleEscKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [onClose]);

  return (
    <div
      tabIndex={-1}
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center w-full h-full bg-black bg-opacity-50"
    >
      <div className="relative w-full h-full flex items-end md:items-center justify-center p-0 md:p-4">
        <div
          className={twMerge("w-full md:max-w-2xl md:h-auto bg-white border border-gray-300 md:rounded-2xl shadow-md transition-transform transform translate-y-0 md:translate-y-0", className)}
        >
          <header
            className={`flex ${isScrolled && 'shadow-md'} bg-[#f3f3f3] items-center justify-between px-4 py-2 border-b border-gray-300 md:rounded-t-2xl`}
          >
            <h3 className="md:text-sm text-base font-medium text-primary">{name}</h3>
            <button
              onClick={onClose}
              type="button"
              className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
              data-modal-hide="default-modal"
            >
              <CloseIcon className="md:size-5 size-[22px]" />
            </button>
          </header>
          <main
            ref={mainRef}
            className={twMerge(`overflow-y-auto md:max-h-none max-h-[80vh]`, classNameModal)}
            style={{ scrollbarWidth: 'thin' }}
          >
            {children}
          </main>
          <footer
            style={{
              boxShadow: !isScrolledToEnd
                ? '0 -4px 6px -1px rgba(0, 0, 0, 0.1), 0 -2px 4px -1px rgba(0, 0, 0, 0.06)'
                : 'none'
            }}
            className="flex md:flex-row flex-col-reverse md:space-x-3 items-center justify-end px-4 py-3 border-t border-gray-300 rounded-b-2xl"
          >
            {showDeleteButton && (
              <div className="flex justify-start w-full">
                <Button
                  styleButton="red"
                  type="button"
                  onClick={onClickDelete}
                  className="md:w-auto md:mb-0 mb-2 md:mt-0 mt-2 w-full px-3 text-white md:py-1.5 py-2 md:text-2xs text-sm"
                >
                  {deleteButtonLabel}
                </Button>
              </div>
            )}
            <Button
              type="button"
              styleButton="primary"
              onClick={onClose}
              className="px-2 md:w-auto w-full text-center md:py-1.5 py-3 md:text-2xs text-base text-primary"
            >
              <span className="w-full text-center">Cancelar</span>
            </Button>
            <Button
              type="button"
              styleButton="secondary"
              onClick={onClickSave}
              className="bg-primary md:w-auto md:mb-0 mb-2 w-full px-3 text-white md:py-1.5 py-3 md:text-2xs text-base"
            >
              <span className="w-full text-center">{principalButtonName}</span>
            </Button>
          </footer>
        </div>
      </div>
    </div>
  );
}
