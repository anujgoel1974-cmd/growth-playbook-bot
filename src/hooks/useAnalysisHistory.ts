import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface SavedAnalysis {
  id: string;
  session_id: string;
  url: string;
  title: string | null;
  thumbnail_url: string | null;
  created_at: string;
  accessed_at: string;
  is_favorite: boolean;
  analysis_data: any;
  product_name: string | null;
  brand_name: string | null;
  channels: string[] | null;
}

export const useAnalysisHistory = (searchQuery = "", channelFilter = "", sortBy = "newest") => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: analyses, isLoading } = useQuery({
    queryKey: ["analysis-history", searchQuery, channelFilter, sortBy],
    queryFn: async () => {
      let query = supabase
        .from("saved_analyses")
        .select("*");

      // Apply search filter
      if (searchQuery) {
        query = query.or(`url.ilike.%${searchQuery}%,product_name.ilike.%${searchQuery}%,title.ilike.%${searchQuery}%`);
      }

      // Apply channel filter
      if (channelFilter && channelFilter !== "all") {
        query = query.contains("channels", [channelFilter]);
      }

      // Apply sorting
      if (sortBy === "newest") {
        query = query.order("created_at", { ascending: false });
      } else if (sortBy === "oldest") {
        query = query.order("created_at", { ascending: true });
      } else if (sortBy === "accessed") {
        query = query.order("accessed_at", { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as SavedAnalysis[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("saved_analyses")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["analysis-history"] });
      toast({
        title: "Analysis deleted",
        description: "The analysis has been removed from your history.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete analysis. Please try again.",
        variant: "destructive",
      });
    },
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: async ({ id, isFavorite }: { id: string; isFavorite: boolean }) => {
      const { error } = await supabase
        .from("saved_analyses")
        .update({ is_favorite: !isFavorite })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["analysis-history"] });
    },
  });

  const updateTitleMutation = useMutation({
    mutationFn: async ({ id, title }: { id: string; title: string }) => {
      const { error } = await supabase
        .from("saved_analyses")
        .update({ title })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["analysis-history"] });
      toast({
        title: "Title updated",
        description: "Analysis title has been updated.",
      });
    },
  });

  return {
    analyses: analyses || [],
    isLoading,
    deleteAnalysis: deleteMutation.mutate,
    toggleFavorite: toggleFavoriteMutation.mutate,
    updateTitle: updateTitleMutation.mutate,
  };
};
