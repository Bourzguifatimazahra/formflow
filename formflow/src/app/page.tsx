
"use client";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { PlusCircle, Eye, BarChart3, Zap, Trash2, Pencil, Share2 } from 'lucide-react';
import type { Form } from '@/types';
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

// Mock authentication check
const useIsAuthenticated = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('authToken');
      setIsAuthenticated(!!token);
    };
    checkAuth();
    // Listen for storage changes to update auth status (e.g., after login/logout)
    window.addEventListener('storage', checkAuth);
    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, []);
  return isAuthenticated;
};

export default function DashboardPage() {
  const [forms, setForms] = useState<Form[]>([]);
  const isAuthenticated = useIsAuthenticated();
  const { toast } = useToast();
  
  useEffect(() => {
    if (isAuthenticated) {
      const storedForms = localStorage.getItem('createdForms');
      if (storedForms) {
        try {
          const parsedForms = JSON.parse(storedForms) as Form[];
          setForms(parsedForms);
        } catch (error) {
          console.error("Failed to parse forms from localStorage", error);
          setForms([]); // Set to empty array on error
          toast({
            title: "Error Loading Forms",
            description: "Could not load your saved forms. They might be corrupted.",
            variant: "destructive",
          });
        }
      } else {
        setForms([]); // No forms stored
      }
    } else {
      setForms([]);
    }
  }, [isAuthenticated, toast]);

  const handleDeleteForm = (formId: string) => {
    const updatedForms = forms.filter(form => form.id !== formId);
    setForms(updatedForms);
    localStorage.setItem('createdForms', JSON.stringify(updatedForms));
    toast({ title: "Form Deleted", description: "The form has been successfully deleted." });
  };

  const handleShareForm = (publicUrl: string) => {
    const fullUrl = `${window.location.origin}${publicUrl}`;
    navigator.clipboard.writeText(fullUrl)
      .then(() => {
        toast({ title: "Link Copied!", description: "Form link copied to clipboard." });
      })
      .catch(err => {
        console.error("Failed to copy link: ", err);
        toast({ title: "Copy Failed", description: "Could not copy link to clipboard.", variant: "destructive" });
      });
  };
  
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center">
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary mb-6">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <h1 className="text-4xl font-bold mb-4">Welcome to FormFlow</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Create engaging, one-question-at-a-time forms and gather valuable insights.
        </p>
        <div className="space-x-4">
          <Button asChild size="lg">
            <Link href="/auth/login">Login</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/auth/signup">Sign Up</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">My Forms</h1>
        <Button asChild>
          <Link href="/forms/create">
            <PlusCircle className="mr-2 h-5 w-5" /> Create New Form
          </Link>
        </Button>
      </div>

      {forms.length === 0 ? (
        <Card className="text-center py-12">
          <CardHeader>
            <CardTitle className="text-2xl">No forms yet!</CardTitle>
            <CardDescription>Start by creating your first form.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="lg">
              <Link href="/forms/create">
                <PlusCircle className="mr-2 h-5 w-5" /> Create Form
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {forms.map((form) => (
            <Card key={form.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="truncate">{form.title}</CardTitle>
                <CardDescription className="truncate h-10">
                  {form.description || 'No description available.'}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground">
                  Created: {new Date(form.createdAt).toLocaleDateString()}
                </p>
                 <p className="text-xs text-muted-foreground mt-1">
                  ID: {form.id}
                </p>
              </CardContent>
              <CardFooter className="grid grid-cols-3 gap-2 pt-4">
                <Button variant="outline" asChild className="w-full">
                  <Link href={form.publicUrl}>
                    <Eye className="mr-2 h-4 w-4" /> View
                  </Link>
                </Button>
                 <Button variant="outline" asChild className="w-full">
                  <Link href={`/forms/${form.id}/edit`}>
                    <Pencil className="mr-2 h-4 w-4" /> Edit
                  </Link>
                </Button>
                <Button variant="outline" onClick={() => handleShareForm(form.publicUrl)} className="w-full">
                  <Share2 className="mr-2 h-4 w-4" /> Share
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <Link href={`${form.publicUrl}/analytics`}>
                    <BarChart3 className="mr-2 h-4 w-4" /> Analytics
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <Link href={`${form.publicUrl}/optimize`}>
                    <Zap className="mr-2 h-4 w-4" /> Optimize
                  </Link>
                </Button>
                <Button variant="destructive" onClick={() => handleDeleteForm(form.id)} className="w-full">
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
