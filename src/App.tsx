import React, { useState, useEffect } from 'react';
import { Navbar } from './components/common/Navbar';
import { MegaMenu } from './components/common/MegaMenu';
import { Footer } from './components/common/Footer';
import { Hero } from './components/home/Hero';
import { Workspace } from './components/workspace/Workspace';
import { ToolDirectory } from './components/tools/ToolDirectory';
import { InteractiveToolWorkspace } from './components/tools/InteractiveToolWorkspace';
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
  const [interactiveTool, setInteractiveTool] = useState<ToolDefinition | null>(null);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);

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
    setInteractiveTool(null);

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
    setInteractiveTool(tool);
    setIsMegaMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateTools = () => {
    setInteractiveTool(null);
    setTimeout(() => {
      document.getElementById('all-tools')?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  const handleNavigateHome = () => {
    setInteractiveTool(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-df-white dark:bg-df-black text-df-black dark:text-df-white transition-colors relative">
      {/* Top Navigation */}
      <Navbar
        darkMode={darkMode}
        onToggleDarkMode={handleToggleDarkMode}
        onOpenPrivacy={() => setPrivacyOpen(true)}
        onOpenAbout={() => setAboutOpen(true)}
        onOpenFormats={() => setFormatsOpen(true)}
        onNavigateTools={handleNavigateTools}
        onNavigateHome={handleNavigateHome}
        onSelectTool={handleSelectTool}
        onToggleMegaMenu={() => setIsMegaMenuOpen(!isMegaMenuOpen)}
        isMegaMenuOpen={isMegaMenuOpen}
      />

      {/* Floating MegaMenu */}
      <MegaMenu
        isOpen={isMegaMenuOpen}
        onClose={() => setIsMegaMenuOpen(false)}
        onSelectTool={handleSelectTool}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {interactiveTool ? (
          /* Dedicated iLovePDF Interactive Workspace */
          <InteractiveToolWorkspace
            tool={interactiveTool}
            onBack={() => setInteractiveTool(null)}
            onSelectOtherTool={handleSelectTool}
          />
        ) : uploadedFiles.length > 0 ? (
          /* Multi-file batch Workspace */
          <section id="workspace-section" className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Workspace
              files={uploadedFiles}
              onAddFiles={handleAddFiles}
              onRemoveFile={handleRemoveFile}
              onClearFiles={handleClearFiles}
            />
          </section>
        ) : (
          /* Standard Home View: Hero with iLovePDF quick grid + Universal Dropzone */
          <>
            <Hero
              onFilesSelected={handleAddFiles}
              onExploreTools={handleNavigateTools}
              onSelectTool={handleSelectTool}
            />
            {/* Tool Directory (Searchable 50+ tool grid) */}
            <ToolDirectory onSelectTool={handleSelectTool} />
          </>
        )}
      </main>

      {/* Footer */}
      <Footer
        onOpenPrivacy={() => setPrivacyOpen(true)}
        onOpenAbout={() => setAboutOpen(true)}
        onOpenFormats={() => setFormatsOpen(true)}
        onOpenContact={() => setContactOpen(true)}
      />

      {/* Information Modals */}
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
