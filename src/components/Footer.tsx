import Link from 'next/link';

const Footer = () => {
  return (
    <footer className='bg-white text-black py-12 border-t border-library-border'>
      <div className='container mx-auto px-6'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
          {/* Brand Section */}
          <div className='space-y-4'>
            <h3 className='text-2xl font-bold text-black'>Dirck Mulder</h3>
            <p className='text-library-gray'>
              Full-stack developer passionate about creating innovative
              solutions.
            </p>
          </div>

          {/* Quick Links */}
          <div className='space-y-4'>
            <h4 className='text-lg font-semibold text-black'>Quick Links</h4>
            <div className='space-y-2'>
              <a
                href='#projects'
                className='block text-library-gray hover:text-black transition-colors'
              >
                Projects
              </a>
              <a
                href='#about'
                className='block text-library-gray hover:text-black transition-colors'
              >
                About Me
              </a>
              <a
                href='#experience'
                className='block text-library-gray hover:text-black transition-colors'
              >
                Experience
              </a>
              <a
                href='#contact'
                className='block text-library-gray hover:text-black transition-colors'
              >
                Contact
              </a>
              <Link
                href='/components'
                className='block text-library-gray hover:text-black transition-colors'
              >
                Components
              </Link>
              <Link
                href='/blog'
                className='block text-library-gray hover:text-black transition-colors'
              >
                Blog
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div className='space-y-4'>
            <h4 className='text-lg font-semibold text-black'>Get In Touch</h4>
            <div className='space-y-2'>
              <p className='text-library-gray'>
                Email: dirckmulder20@gmail.com
              </p>
              <p className='text-library-gray'>Phone: +31 6 250 217 55</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className='border-t border-library-border mt-8 pt-8 text-center'>
          <p className='text-library-gray'>
            &copy; 2024 Dirck Mulder. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
