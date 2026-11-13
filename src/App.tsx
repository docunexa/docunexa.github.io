import React, { useState, useEffect } from 'react';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { Hero } from './components/home/Hero';
import { Workspace } from './components/workspace/Workspace';
import { ToolDirectory } from './components/tools/ToolDirectory';
import { ToolModal } from './components/tools/ToolModal';
import { PrivacyModal } from './components/views/PrivacyModal';
import { AboutModal } from './components/views/AboutModal';
import { FormatsModal } from './components/views/FormatsModal';
import { ContactModal } from './components/views/ContactModal';
import { UploadedFileItem, ToolDefinition } from './types';
import { getFileExtension } from './utils/formatters';

export function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('docuflow-theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileItem[]>([]);
  const [activeTool, setActiveTool] = useState<ToolDefinition | null>(null);

  // Modals state
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [formatsOpen, setFormatsOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  // Apply dark mode class to html element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('docuflow-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('docuflow-theme', 'light');
    }
  }, [darkMode]);

  const handleToggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleAddFiles = (files: File[]) => {
    const newItems: UploadedFileItem[] = files.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      extension: getFileExtension(file.name),
      status: 'idle',
    }));

    setUploadedFiles((prev) => [...prev, ...newItems]);

    // Scroll smoothly to workspace
    setTimeout(() => {
      document.getElementById('workspace-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleRemoveFile = (id: string) => {
    setUploadedFiles((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearFiles = () => {
    setUploadedFiles([]);
  };

  const handleSelectTool = (tool: ToolDefinition) => {
    setActiveTool(tool);
  };

  const handleNavigateTools = () => {
    document.getElementById('all-tools')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleNavigateHome = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-df-white dark:bg-df-black text-df-black dark:text-df-white transition-colors">
      {/* Top Navigation */}
      <Navbar
        darkMode={darkMode}
        onToggleDarkMode={handleToggleDarkMode}
        onOpenPrivacy={() => setPrivacyOpen(true)}
        onOpenAbout={() => setAboutOpen(true)}
        onOpenFormats={() => setFormatsOpen(true)}
        onNavigateTools={handleNavigateTools}
        onNavigateHome={handleNavigateHome}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Hero Section */}
        {uploadedFiles.length === 0 ? (
          <Hero
            onFilesSelected={handleAddFiles}
            onExploreTools={handleNavigateTools}
          />
        ) : (
          <section id="workspace-section" className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Workspace
              files={uploadedFiles}
              onAddFiles={handleAddFiles}
              onRemoveFile={handleRemoveFile}
              onClearFiles={handleClearFiles}
            />
          </section>
        )}

        {/* Tool Directory (Searchable 50+ tool grid) */}
        <ToolDirectory onSelectTool={handleSelectTool} />
      </main>

      {/* Footer */}
      <Footer
        onOpenPrivacy={() => setPrivacyOpen(true)}
        onOpenAbout={() => setAboutOpen(true)}
        onOpenFormats={() => setFormatsOpen(true)}
        onOpenContact={() => setContactOpen(true)}
      />

      {/* Modals */}
      <ToolModal
        tool={activeTool}
        isOpen={!!activeTool}
        onClose={() => setActiveTool(null)}
      />

      <PrivacyModal
        isOpen={privacyOpen}
        onClose={() => setPrivacyOpen(false)}
      />

      <AboutModal
        isOpen={aboutOpen}
        onClose={() => setAboutOpen(false)}
      />

      <FormatsModal
        isOpen={formatsOpen}
        onClose={() => setFormatsOpen(false)}
      />

      <ContactModal
        isOpen={contactOpen}
        onClose={() => setContactOpen(false)}
      />
    </div>
  );
}

export default App;

