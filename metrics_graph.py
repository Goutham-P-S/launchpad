import matplotlib.pyplot as plt
import numpy as np
import os

labels = ['Automation Level(%)', 'Customizability(%)', 'Deployment Speed(%)', 'Workflow Integration(%)']
ours = [95, 90, 95, 100]
nocode = [80, 40, 90, 60]
traditional = [10, 100, 20, 30]

x = np.arange(len(labels))
width = 0.25

fig, ax = plt.subplots(figsize=(10, 6))
rects1 = ax.bar(x - width, ours, width, label='StartupOptima (Proposed System)', color='#4f46e5')
rects2 = ax.bar(x, nocode, width, label='Commercial No-Code', color='#9ca3af')
rects3 = ax.bar(x + width, traditional, width, label='Traditional Development', color='#e5e7eb')

ax.set_ylabel('Performance Score (0-100)')
ax.set_title('Architecture Comparison Across Key Orchestration Metrics')
ax.set_xticks(x)
ax.set_xticklabels(labels)
ax.legend()
ax.grid(axis='y', linestyle='--', alpha=0.7)

# Add value labels
def autolabel(rects):
    for rect in rects:
        height = rect.get_height()
        ax.annotate(f'{height}',
                    xy=(rect.get_x() + rect.get_width() / 2, height),
                    xytext=(0, 3),  # 3 points vertical offset
                    textcoords="offset points",
                    ha='center', va='bottom', fontsize=9)

autolabel(rects1)
autolabel(rects2)
autolabel(rects3)

plt.tight_layout()
output_path = os.path.join(os.path.dirname(__file__), 'comparison_metrics.png')
plt.savefig(output_path, dpi=300)
print(f"Graph generated at {output_path}")
