import os
from graphviz import Digraph

def generate_control_flow():
    dot = Digraph(comment='Launchpad Control Flow Diagram', format='png')
    dot.attr(rankdir='TB', nodesep='0.6', ranksep='0.8')

    # Define Node Styles
    dot.attr('node', shape='box', style='rounded,filled', fillcolor='#f3f4f6', fontname='Helvetica', color='#4b5563', penwidth='1.5')
    dot.attr('edge', color='#6b7280', fontname='Helvetica', fontsize='10', penwidth='1.2')

    # UI Layer
    with dot.subgraph(name='cluster_ui') as ui:
        ui.attr(style='dashed', color='#9ca3af', label='Launchpad Admin UI')
        ui.node('A', 'User Input Form:\nRequirement, Templates,\nAPI Integrations', fillcolor='#dbeafe', color='#2563eb')
        ui.node('B', 'React Frontend API Call', fillcolor='#dbeafe', color='#2563eb')
        ui.edge('A', 'B', label=' Submit ')

    # API Orchestration Engine Layer
    with dot.subgraph(name='cluster_orchestrator') as orchestrator:
        orchestrator.attr(style='dashed', color='#9ca3af', label='Macro-Orchestrator API (Express.js)')
        orchestrator.node('C', 'Job Queue Worker\n(Redis/BullMQ)', fillcolor='#fef08a', color='#ca8a04')
        orchestrator.node('D', 'Sandbox Supervisor\n(Workspace + Port Allocator)', fillcolor='#fef08a', color='#ca8a04')
        
        # Parallel Agents
        orchestrator.node('E1', 'Frontend Agent\nLLM Planner & Builder', fillcolor='#fed7aa', color='#ea580c')
        orchestrator.node('E2', 'Backend Server Agent\n(Prisma Schema generator)', fillcolor='#fed7aa', color='#ea580c')
        orchestrator.node('E3', 'n8n Workflow Planner\n(Zod validation & Webhooks)', fillcolor='#fed7aa', color='#ea580c')
        
    # Docker Deployment Layer
    with dot.subgraph(name='cluster_docker') as docker:
        docker.attr(style='dashed', color='#9ca3af', label='Isolated Docker Compose Sandbox')
        docker.node('F1', 'React/Vite User Application', fillcolor='#bbf7d0', color='#16a34a')
        docker.node('F2', 'Express Backend API', fillcolor='#bbf7d0', color='#16a34a')
        docker.node('F3', 'PostgreSQL Database', fillcolor='#bbf7d0', color='#16a34a')
        docker.node('F4', 'n8n Automation Engine', fillcolor='#bbf7d0', color='#16a34a')

    # External Integrations
    dot.node('G', 'External APIs\n(SendGrid / Twilio)', shape='cylinder', fillcolor='#e5e7eb', color='#4b5563')

    # Main Edges connecting layers
    dot.edge('B', 'C', label=' POST HTTP Payload ')
    dot.edge('C', 'D', label=' Dispatch Orchestration')
    
    # Allocate to Agents
    dot.edge('D', 'E1', label=' Async Compilation')
    dot.edge('D', 'E2', label=' AST Synthesis')
    dot.edge('D', 'E3', label=' IRv1 Synthesis')
    
    # E2 outputs schema for E3 logic
    dot.edge('E2', 'E3', label=' Passes normalized DB schema ')
    
    # Deploy to Docker
    dot.edge('E1', 'F1', label=' Write JSX & CSS')
    dot.edge('E2', 'F2', label=' Write Controllers')
    dot.edge('E2', 'F3', label=' Prisma migrate')
    dot.edge('E3', 'F4', label=' Compile n8n Workflows\n(Credentials Injected)')
    
    # Sandbox Interactions
    dot.edge('F1', 'F2', label=' REST API Fetch', style='dashed')
    dot.edge('F2', 'F3', label=' Query ORM', style='dashed')
    dot.edge('F2', 'F4', label=' DB Entity Triggers Webhooks', style='dashed', arrowtail='diamond')
    dot.edge('F4', 'G', label=' Bearer Auth POST', dir='forward', color='#ef4444', penwidth='2')

    # Render graphics
    output_path = os.path.join(os.path.dirname(__file__), 'control_flow_diagram')
    dot.render(output_path, view=False)
    print(f"Diagram generated at {output_path}.png")

if __name__ == '__main__':
    generate_control_flow()
