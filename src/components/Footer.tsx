const Footer = () => {
  return (
    <footer className='bg-portfolio-dark text-portfolio-text py-12'>
      <div className='container mx-auto px-6'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
          {/* Brand Section */}
          <div className='space-y-4'>
            <h3 className='text-2xl font-bold'>Dirck Mulder</h3>
            <p className='text-portfolio-text-muted'>
              Full-stack developer passionate about creating innovative
              solutions.
            </p>
          </div>

          {/* Quick Links */}
          <div className='space-y-4'>
            <h4 className='text-lg font-semibold'>Quick Links</h4>
            <div className='space-y-2'>
              <a
                href='#projects'
                className='block text-portfolio-text-muted hover:text-primary-400 transition-colors'
              >
                Projects
              </a>
              <a
                href='#about'
                className='block text-portfolio-text-muted hover:text-primary-400 transition-colors'
              >
                About Me
              </a>
              <a
                href='#experience'
                className='block text-portfolio-text-muted hover:text-primary-400 transition-colors'
              >
                Experience
              </a>
              <a
                href='#contact'
                className='block text-portfolio-text-muted hover:text-primary-400 transition-colors'
              >
                Contact
              </a>
            </div>
          </div>

          {/* Contact Info */}
          <div className='space-y-4'>
            <h4 className='text-lg font-semibold'>Get In Touch</h4>
            <div className='space-y-2'>
              <p className='text-portfolio-text-muted'>
                Email: dirckmulder20@gmail.com
              </p>
              <p className='text-portfolio-text-muted'>
                Phone: +31 6 250 217 55
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className='border-t border-portfolio-border mt-8 pt-8 text-center'>
          <p className='text-portfolio-text-muted'>
            © 2024 Dirck Mulder. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
