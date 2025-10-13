import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    console.log('[Orchestrator] Starting analysis for URL:', url);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Create session
    const { data: session, error: sessionError } = await supabase
      .from('analysis_sessions')
      .insert({ url, status: 'in_progress' })
      .select()
      .single();

    if (sessionError) throw sessionError;
    console.log('[Orchestrator] Created session:', session.id);

    // 2. Initialize all sections as "pending"
    const sections = [
      'customer_insight',
      'campaign_targeting', 
      'media_plan',
      'competitive_analysis',
      'ad_creative'
    ];

    await Promise.all(sections.map(section => 
      supabase.from('analysis_progress').insert({
        session_id: session.id,
        section_name: section,
        status: 'pending',
        progress_percentage: 0,
        started_at: new Date().toISOString()
      })
    ));

    console.log('[Orchestrator] Initialized progress tracking');

    try {
      // 3. Call EXISTING analyze-landing-page function
      console.log('[Orchestrator] Calling analyze-landing-page...');
      
      const { data, error } = await supabase.functions.invoke('analyze-landing-page', {
        body: { url }
      });

      if (error) {
        console.error('[Orchestrator] Analysis function error:', error);
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error || 'Analysis failed');
      }

      console.log('[Orchestrator] Analysis completed successfully');
      const analysis = data.analysis;

      // 4. Update progress for completed sections
      const updatePromises = [];

      if (analysis.customerInsight) {
        updatePromises.push(
          supabase.from('analysis_progress').update({
            status: 'completed',
            progress_percentage: 100,
            data: { cards: analysis.customerInsight },
            completed_at: new Date().toISOString()
          }).eq('session_id', session.id).eq('section_name', 'customer_insight')
        );
      }

      if (analysis.campaignTargeting) {
        updatePromises.push(
          supabase.from('analysis_progress').update({
            status: 'completed',
            progress_percentage: 100,
            data: { cards: analysis.campaignTargeting },
            completed_at: new Date().toISOString()
          }).eq('session_id', session.id).eq('section_name', 'campaign_targeting')
        );
      }

      if (analysis.mediaPlan) {
        updatePromises.push(
          supabase.from('analysis_progress').update({
            status: 'completed',
            progress_percentage: 100,
            data: { weeks: analysis.mediaPlan },
            completed_at: new Date().toISOString()
          }).eq('session_id', session.id).eq('section_name', 'media_plan')
        );
      }

      if (analysis.competitiveAnalysis) {
        updatePromises.push(
          supabase.from('analysis_progress').update({
            status: 'completed',
            progress_percentage: 100,
            data: analysis.competitiveAnalysis,
            completed_at: new Date().toISOString()
          }).eq('session_id', session.id).eq('section_name', 'competitive_analysis')
        );
      }

      if (analysis.adCreatives) {
        updatePromises.push(
          supabase.from('analysis_progress').update({
            status: 'completed',
            progress_percentage: 100,
            data: { creatives: analysis.adCreatives },
            completed_at: new Date().toISOString()
          }).eq('session_id', session.id).eq('section_name', 'ad_creative')
        );
      }

      await Promise.all(updatePromises);
      console.log('[Orchestrator] Updated all section progress');

      // 5. Trigger research agent for background enhancement (non-blocking)
      if (analysis.competitiveAnalysis?.competitors) {
        console.log('[Orchestrator] Triggering research agent in background...');
        supabase.functions.invoke('research-agent', {
          body: {
            sessionId: session.id,
            competitors: analysis.competitiveAnalysis.competitors
          }
        }).then(() => {
          console.log('[Orchestrator] Research agent completed background enhancement');
        }).catch((err) => {
          console.error('[Orchestrator] Research agent error (non-fatal):', err);
        });
      }

      // 6. Mark session complete
      await supabase.from('analysis_sessions').update({
        status: 'completed',
        completed_at: new Date().toISOString()
      }).eq('id', session.id);

      console.log('[Orchestrator] Session marked complete');

      // 7. Return same format as before (backward compatible!)
      return new Response(JSON.stringify({
        ...data,
        sessionId: session.id
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (analysisError) {
      console.error('[Orchestrator] Analysis error:', analysisError);
      
      // Mark all sections as failed
      await Promise.all(sections.map(section =>
        supabase.from('analysis_progress').update({
          status: 'failed',
          completed_at: new Date().toISOString()
        }).eq('session_id', session.id).eq('section_name', section)
      ));

      // Mark session as failed
      await supabase.from('analysis_sessions').update({
        status: 'failed',
        error: analysisError instanceof Error ? analysisError.message : 'Analysis failed',
        completed_at: new Date().toISOString()
      }).eq('id', session.id);

      throw analysisError;
    }

  } catch (error) {
    console.error('[Orchestrator] Fatal error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Orchestration failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
