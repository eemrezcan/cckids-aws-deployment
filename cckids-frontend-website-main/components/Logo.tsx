import { LOGO_URL } from '@/lib/constants';

interface LogoProps {
  className?: string;
}

const Logo = ({ className = 'h-12' }: LogoProps) => {
  return (
    <div className={`relative ${className} flex items-center justify-center`}>
      <img
        src={LOGO_URL}
        alt="CCkids Logo"
        className="h-full w-auto object-contain drop-shadow-md hover:scale-105 transition-transform duration-300"
      />
    </div>
  );
};

export default Logo;
