import React from 'react';

export const AppLogos = ({ name, className = "w-5 h-5" }) => {
  const logoName = name?.toLowerCase().replace(/\s+/g, '');

  switch (logoName) {
    case 'gmail':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <path d="M22 6C22 4.9 21.1 4 20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6ZM20 6L12 11L4 6H20ZM20 18H4V8L12 13L20 8V18Z" fill="#EA4335"/>
        </svg>
      );
    case 'googledrive':
    case 'drive':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
           <path d="M7.71 3.5L1.15 15H12.36L18.91 3.5H7.71ZM22.84 3.5H19.2L12.63 15H16.29L22.84 3.5ZM1.15 15L4.54 21.5H17.58L14.2 15H1.15Z" fill="#4285F4"/>
           <path d="M7.71 3.5L11.53 10L14.44 5H18.91L12.36 15H1.15L7.71 3.5Z" fill="#FFC107"/>
           <path d="M12.36 15L16.29 21.5H4.54L1.15 15H12.36Z" fill="#34A853"/>
           <path d="M18.91 3.5L22.84 10L16.29 21.5L12.36 15L18.91 3.5Z" fill="#1967D2"/>
        </svg>
      );
    case 'microsoftexcel':
    case 'excel':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2ZM18 20H6V4H13V9H18V20ZM9.5 17H11.5L12.9 14.6L14.3 17H16.3L13.8 13.5L16.2 10H14.2L12.8 12.4L11.4 10H9.4L11.9 13.5L9.5 17Z" fill="#217346"/>
        </svg>
      );
    case 'telegram':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM16.64 8.8C16.49 10.38 15.84 14.25 15.5 16.03C15.36 16.79 15.09 17.05 14.85 17.07C14.33 17.12 13.94 16.72 13.44 16.4C12.65 15.88 12.21 15.56 11.44 15.06C10.55 14.47 11.13 14.15 11.64 13.62C11.77 13.48 13.99 11.46 14.03 11.28C14.04 11.25 14.04 11.16 13.99 11.11C13.93 11.07 13.86 11.08 13.8 11.1C13.72 11.12 12.44 11.97 9.97 13.63C9.6 13.88 9.27 14.01 8.87 14C8.43 13.99 7.59 13.75 6.96 13.55C6.19 13.3 5.88 13.13 6.42 12.92C6.7 12.8 11.83 10.67 15.42 9.18C16.14 8.91 16.78 9.26 16.64 8.8Z" fill="#24A1DE"/>
        </svg>
      );
    case 'github':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
          <path d="M12 2C6.47 2 2 6.47 2 12C2 16.42 4.87 20.17 8.84 21.5C9.34 21.58 9.5 21.27 9.5 21C9.5 20.77 9.5 20.14 9.5 19.31C6.73 19.91 6.14 17.97 6.14 17.97C5.68 16.81 5.03 16.5 5.03 16.5C4.13 15.88 5.1 15.9 5.1 15.9C6.1 15.97 6.63 16.93 6.63 16.93C7.5 18.45 8.97 18.01 9.54 17.76C9.63 17.11 9.89 16.67 10.17 16.42C7.95 16.17 5.62 15.31 5.62 11.5C5.62 10.39 6 9.5 6.65 8.79C6.55 8.54 6.2 7.5 6.75 6.15C6.75 6.15 7.59 5.88 9.5 7.17C10.29 6.95 11.15 6.84 12 6.84C12.85 6.84 13.71 6.95 14.5 7.17C16.41 5.88 17.25 6.15 17.25 6.15C17.8 7.5 17.45 8.54 17.35 8.79C18 9.5 18.38 10.39 18.38 11.5C18.38 15.32 16.04 16.16 13.81 16.41C14.17 16.72 14.5 17.33 14.5 18.26C14.5 19.6 14.5 20.68 14.5 21C14.5 21.27 14.66 21.59 15.17 21.5C19.14 20.16 22 16.42 22 12C22 6.47 17.52 2 12 2Z"/>
        </svg>
      );
    case 'googlesheets':
    case 'sheets':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2ZM18 20H6V4H13V9H18V20ZM8 12V14H16V12H8ZM8 16V18H16V16H8Z" fill="#34A853"/>
        </svg>
      );
    case 'slack':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <path d="M6 15C4.9 15 4 15.9 4 17C4 18.1 4.9 19 6 19H8V17C8 15.9 7.1 15 6 15ZM9 15C10.1 15 11 15.9 11 17V21C11 22.1 10.1 23 9 23C7.9 23 7 22.1 7 21V17C7 15.9 7.9 15 9 15ZM15 6C16.1 6 17 5.1 17 4C17 2.9 16.1 2 15 2H13V4C13 5.1 13.9 6 15 6ZM12 6C10.9 6 10 5.1 10 4V2C10 0.9 10.9 0 12 0C13.1 0 14 0.9 14 2V6C14 7.1 13.1 8 12 8H12V6ZM19 9C19 7.9 19.9 7 21 7C22.1 7 23 7.9 23 9V11H21C19.9 11 19 10.1 19 9ZM19 12C19 10.9 19.9 10 21 10H23V14C23 15.1 22.1 16 21 16C19.9 16 19 15.1 19 14V12ZM4 13C4 11.9 4.9 11 6 11H8V9C8 7.9 7.1 7 6 7C4.9 7 4 7.9 4 9V11C4 12.1 4.9 13 4 13ZM9 11C10.1 11 11 10.1 11 9V5C11 3.9 10.1 3 9 3C7.9 3 7 3.9 7 5V9C7 10.1 7.9 11 9 11ZM17 19C18.1 19 19 18.1 19 17C19 15.9 18.1 15 17 15H15V17C15 18.1 15.9 19 17 19ZM14 15C12.9 15 12 15.9 12 17V21C12 22.1 12.9 23 14 23C15.1 23 16 22.1 16 21V17C16 15.9 15.1 15 14 15Z" fill="#E01E5A"/>
        </svg>
      );
    case 'notion':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
            <path d="M4.26 19.33L9.69 4.3C9.76 4.12 9.93 4 10.12 4H18.5C18.78 4 19 4.22 19 4.5V19.5C19 19.78 18.78 20 18.5 20H15.5C15.22 20 15 19.78 15 19.5V8.22L8.71 20H4.5C4.22 20 4 19.78 4 19.5V5.5C4 5.22 4.22 5 4.5 5H7.5C7.78 5 8 5.22 8 5.5V16.78L4.26 19.33Z" />
        </svg>
      );
    case 'googlecalendar':
    case 'calendar':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
            <path d="M19 4H18V2H16V4H8V2H6V4H5C3.89 4 3.01 4.9 3.01 6L3 20C3 21.1 3.89 22 5 22H19C20.1 22 21 21.1 21 20V6C21 4.9 20.1 4 19 4ZM19 20H5V10H19V20ZM19 8H5V6H19V8ZM9 14H7V12H9V14ZM13 14H11V12H13V14ZM17 14H15V12H17V14ZM9 18H7V16H9V18ZM13 18H11V16H13V18ZM17 18H15V16H17V18Z" fill="#4285F4"/>
        </svg>
      );
    case 'trello':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <rect x="3" y="3" width="18" height="18" rx="2" fill="#0079BF"/>
          <rect x="5" y="5" width="6" height="10" rx="1" fill="white" fillOpacity="0.8"/>
          <rect x="13" y="5" width="6" height="6" rx="1" fill="white" fillOpacity="0.8"/>
        </svg>
      );
    case 'stripe':
      return (
        <svg viewBox="0 0 24 24" fill="#635BFF" className={className}>
          <path d="M13.9 14.1C13.9 13.4 13.2 13 12.3 13C10.7 13 9.7 13.4 9.1 13.6L8.6 11.2C9.4 10.9 10.8 10.7 12.2 10.7C15.3 10.7 17.5 12.1 17.5 15.4V22H13.9V20.2C13.1 21.4 11.6 22.2 9.8 22.2C7 22.2 4.9 20.3 4.9 17.5C4.9 14.6 7.4 12.8 11.5 12.8V12.7C11.5 12.2 11.8 10.9 14.2 10.9C15 10.9 15.9 11.1 16.3 11.3L16.8 9.1C16.1 8.8 15.1 8.6 13.9 8.6C10.3 8.6 7.8 10.5 7.8 14.5V22H4V2H13.9V14.1ZM13.8 16C13.1 15.5 12.3 15.3 11.5 15.3C9.6 15.3 8.7 16.3 8.7 17.6C8.7 18.7 9.5 19.6 10.9 19.6C12.5 19.6 13.9 18.3 13.9 16.4V16H13.8Z"/>
        </svg>
      );
    case 'microsoftoutlook':
    case 'outlook':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
            <path d="M1 6L13.5 14.5L23 6" stroke="#0078D4" strokeWidth="2"/>
            <rect x="1" y="4" width="22" height="16" rx="2" stroke="#0078D4" strokeWidth="2"/>
        </svg>
      );
    case 'googleforms':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <path d="M17 2H7C5.9 2 5 2.9 5 4V20C5 21.1 5.9 22 7 22H17C18.1 22 19 21.1 19 20V4C19 2.9 18.1 2 17 2ZM15 5H9V3H15V5ZM15 7H9V9H15V7ZM15 11H9V13H15V11ZM11 15H9V17H11V15Z" fill="#7248B9"/>
        </svg>
      );
    case 'hubspot':
      return (
        <svg viewBox="0 0 24 24" fill="#FF7A59" className={className}>
          <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.58 20 4 16.42 4 12C4 7.58 7.58 4 12 4C16.42 4 20 7.58 20 12C20 16.42 16.42 20 12 20ZM12 6C8.69 6 6 8.69 6 12C6 15.31 8.69 18 12 18C15.31 18 18 15.31 18 12C18 8.69 15.31 6 12 6ZM12 8C14.21 8 16 9.79 16 12C16 14.21 14.21 16 12 16C9.79 16 8 14.21 8 12C8 9.79 9.79 8 12 8Z"/>
        </svg>
      );
    case 'facebookleadads':
    case 'facebook':
      return (
         <svg viewBox="0 0 24 24" fill="#1877F2" className={className}>
           <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24V15.563H7.078V12.073H10.125V9.429C10.125 6.42 11.917 4.761 14.657 4.761C15.97 4.761 17.344 4.995 17.344 4.995V7.948H15.83C14.34 7.948 13.875 8.873 13.875 9.822V12.073H17.203L16.67 15.563H13.875V24C19.612 23.094 24 18.1 24 12.073Z"/>
         </svg>
      );
    case 'mailchimp':
      return (
         <svg viewBox="0 0 24 24" fill="#FFE01B" className={className}>
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" fill="black" opacity="0.1"/>
            <path d="M17.5 12C17.5 14.5 15.5 16.5 13 16.5C11.5 16.5 10.2 15.8 9.4 14.8C8.6 15.8 7.3 16.5 5.8 16.5C3.3 16.5 1.3 14.5 1.3 12C1.3 9.5 3.3 7.5 5.8 7.5C7.3 7.5 8.6 8.2 9.4 9.2C10.2 8.2 11.5 7.5 13 7.5C15.5 7.5 17.5 9.5 17.5 12Z" fill="currentColor"/>
         </svg>
      );
    case 'twitter':
       return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
           <path d="M18.244 2.25H21.552L14.325 10.51L22.827 21.75H16.17L10.956 14.933L4.99 21.75H1.68L9.41 12.915L1.254 2.25H8.08L12.793 8.481L18.244 2.25ZM17.081 19.77H18.916L7.084 4.073H5.117L17.081 19.77Z"/>
        </svg>
       );
    default:
      return (
        <div className={`${className} bg-gray-200 rounded-md flex items-center justify-center text-xs font-bold text-gray-500`}>
          {name?.[0]?.toUpperCase()}
        </div>
      );
  }
};