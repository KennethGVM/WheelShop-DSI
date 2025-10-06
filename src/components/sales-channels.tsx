import { FC, JSX } from 'react';
import { EyeIcon } from "@/icons/icons";

interface SalesChannelProps {
  children: JSX.Element;
  text: string;
  showEyeIcon?: boolean;
}

const SalesChannel: FC<SalesChannelProps> = ({ children, text, showEyeIcon = false }) => (
  <div className="group flex items-center justify-between w-full hover:bg-white/30 mb-2 cursor-pointer py-1 px-3 rounded-lg">
    <div className="flex items-center space-x-2">
      {children}
      <h3 className="text-[#4a4a4a] font-semibold text-2xs">{text}</h3>
    </div>
    {showEyeIcon && (
      <div className="hover:bg-graying/20 rounded-md px-[1px] hidden group-hover:block">
        <EyeIcon />
      </div>
    )}
  </div>
);

export default SalesChannel;
