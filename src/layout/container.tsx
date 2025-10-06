import { JSX, useState } from 'react';
import Header from "@/layout/header";
import Aside from "@/layout/aside";
import { Toaster } from 'react-hot-toast';

export default function Container({
  text,
  isLoading = false,
  save = false,
  children,
  onSaveClick,
  onClickSecondary
}: {
  isLoading?: boolean;
  text?: string;
  save?: boolean;
  children?: JSX.Element;
  onSaveClick?: () => void;
  onClickSecondary?: () => void;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  return (
    <div id='app' className='flex flex-col h-screen overflow-hidden'>
      <Toaster />
      <Header isSidebarOpen={isSidebarOpen} text={text} save={save} onClickSecondary={onClickSecondary} onClick={onSaveClick} onClickAside={() => setIsSidebarOpen(!isSidebarOpen)} isLoading={isLoading} />
      <Aside setIsSidebarOpen={setIsSidebarOpen} isSidebarOpen={isSidebarOpen} />
      <main id='main' className='bg-[#f1f1f1] md:px-5 rounded-tr-xl overflow-auto'>
        <div className='pb-10 pt-5' style={{ scrollbarWidth: 'thin' }}>
          {children}
        </div>
      </main>
    </div>
  )
}
