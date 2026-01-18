import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { LocalizationProvider, useLocalization } from '../LocalizationContext';

const TestComponent = () => {
  const { t, locale, setLocale } = useLocalization();
  return (
    <div>
      <div data-testid="locale">{locale}</div>
      <div data-testid="greeting">{t('header.home')}</div>
      <div data-testid="nested">{t('writingTools.summarizer.pageTitle')}</div>
      <div data-testid="variable">{t('writingTools.aiDetector.toastFileExtracted', { fileName: 'report.pdf' })}</div>
      <button onClick={() => setLocale('ar')}>Switch to Arabic</button>
      <button onClick={() => setLocale('en')}>Switch to English</button>
    </div>
  );
};

describe('LocalizationContext', () => {

  beforeEach(() => {
    // Reset mocks and localStorage
    localStorage.clear();
    // Reset document properties
    document.documentElement.lang = '';
    document.documentElement.dir = '';
  });

  it('should provide default English translations', () => {
    render(
      <LocalizationProvider>
        <TestComponent />
      </LocalizationProvider>
    );

    expect(screen.getByTestId('locale')).toHaveTextContent('en');
    expect(screen.getByTestId('greeting')).toHaveTextContent('Home');
    expect(screen.getByTestId('nested')).toHaveTextContent('AI Summarizer');
  });

  it('should switch to Arabic and update translations', () => {
    render(
      <LocalizationProvider>
        <TestComponent />
      </LocalizationProvider>
    );

    // Initial state
    expect(screen.getByTestId('greeting')).toHaveTextContent('Home');

    // Switch to Arabic
    fireEvent.click(screen.getByText('Switch to Arabic'));

    expect(screen.getByTestId('locale')).toHaveTextContent('ar');
    expect(screen.getByTestId('greeting')).toHaveTextContent('الرئيسية');
    expect(screen.getByTestId('nested')).toHaveTextContent('الملخص بالذكاء الاصطناعي');
  });

  it('should update document lang and dir attributes', () => {
    render(
      <LocalizationProvider>
        <TestComponent />
      </LocalizationProvider>
    );

    expect(document.documentElement.lang).toBe('en');
    expect(document.documentElement.dir).toBe('ltr');

    fireEvent.click(screen.getByText('Switch to Arabic'));

    expect(document.documentElement.lang).toBe('ar');
    expect(document.documentElement.dir).toBe('rtl');
    
    fireEvent.click(screen.getByText('Switch to English'));
    
    expect(document.documentElement.lang).toBe('en');
    expect(document.documentElement.dir).toBe('ltr');
  });

  it('should persist locale in localStorage', () => {
    const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');
    
    render(
      <LocalizationProvider>
        <TestComponent />
      </LocalizationProvider>
    );

    fireEvent.click(screen.getByText('Switch to Arabic'));
    
    expect(setItemSpy).toHaveBeenCalledWith('locale', 'ar');
    
    setItemSpy.mockRestore();
  });
  
  it('should handle variable interpolation', () => {
    render(
      <LocalizationProvider>
        <TestComponent />
      </LocalizationProvider>
    );
    expect(screen.getByTestId('variable')).toHaveTextContent('Text extracted from report.pdf.');

    fireEvent.click(screen.getByText('Switch to Arabic'));
    expect(screen.getByTestId('variable')).toHaveTextContent('تم استخراج النص من report.pdf.');
  });
});
