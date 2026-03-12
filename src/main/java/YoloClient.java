import org.json.JSONArray;
import org.json.JSONObject;

import javax.imageio.ImageIO;
import javax.swing.*;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class YoloClient {

    private static BufferedImage currentImage = null;
    private static JPanel imagePanel;
    private static JLabel statusLabel = new JLabel("Status: Waiting for Image...");
    private static JLabel detailLabel = new JLabel("Detections: None");

    public static void main(String[] args) {
        JFrame frame = new JFrame("SmartSoil: Chili Health Scanner");
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        frame.setLayout(new BorderLayout());

        // 1. Top Panel: Navigation
        JButton uploadBtn = new JButton("UPLOAD & SCAN PLANT");
        uploadBtn.setFont(new Font("Arial", Font.BOLD, 14));
        uploadBtn.setBackground(new Color(34, 139, 34)); // Forest Green
        uploadBtn.setForeground(Color.WHITE);
        frame.add(uploadBtn, BorderLayout.NORTH);

        // 2. Middle Panel: Image Display
        imagePanel = new JPanel() {
            @Override
            protected void paintComponent(Graphics g) {
                super.paintComponent(g);
                if (currentImage != null) {
                    g.drawImage(currentImage, 0, 0, getWidth(), getHeight(), null);
                }
            }
        };
        imagePanel.setPreferredSize(new Dimension(600, 450));
        imagePanel.setBackground(Color.DARK_GRAY);
        frame.add(imagePanel, BorderLayout.CENTER);

        // 3. Bottom Panel: Results Dashboard
        JPanel resultsPanel = new JPanel(new GridLayout(2, 1));
        resultsPanel.setBorder(BorderFactory.createEmptyBorder(10, 10, 10, 10));

        statusLabel.setFont(new Font("Arial", Font.BOLD, 18));
        detailLabel.setFont(new Font("Arial", Font.ITALIC, 14));

        resultsPanel.add(statusLabel);
        resultsPanel.add(detailLabel);
        frame.add(resultsPanel, BorderLayout.SOUTH);

        // Upload Logic
        uploadBtn.addActionListener(e -> {
            JFileChooser fileChooser = new JFileChooser();
            if (fileChooser.showOpenDialog(null) == JFileChooser.APPROVE_OPTION) {
                File file = fileChooser.getSelectedFile();
                try {
                    currentImage = ImageIO.read(file);
                    statusLabel.setText("Status: SCANNING...");
                    statusLabel.setForeground(Color.BLUE);
                    imagePanel.repaint();
                    scanImage(currentImage);
                } catch (Exception ex) {
                    ex.printStackTrace();
                }
            }
        });

        frame.pack();
        frame.setLocationRelativeTo(null);
        frame.setVisible(true);
    }

    private static void scanImage(BufferedImage img) throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageIO.write(img, "jpg", baos);
        byte[] bytes = baos.toByteArray();

        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("http://localhost:8001/predict"))
                .header("Content-Type", "application/octet-stream")
                .POST(HttpRequest.BodyPublishers.ofByteArray(bytes))
                .build();

        client.sendAsync(request, HttpResponse.BodyHandlers.ofString())
                .thenApply(HttpResponse::body)
                .thenAccept(result -> {
                    // This still prints to console so you can see the raw data
                    System.out.println("AI Result: " + result);

                    JSONObject json = new JSONObject(result);
                    JSONArray predictions = json.getJSONArray("predictions");
                    int count = predictions.length();

                    // Update UI based on logic
                    SwingUtilities.invokeLater(() -> {
                        if (count == 0) {
                            statusLabel.setText("Status: HEALTHY");
                            statusLabel.setForeground(new Color(0, 128, 0)); // Dark Green
                            detailLabel.setText("No leaf spots detected. Plant looks good!");
                        } else {
                            statusLabel.setText("Status: ANOMALY DETECTED");
                            statusLabel.setForeground(Color.RED);
                            detailLabel.setText("Found " + count + " potential leaf spots. Please inspect.");
                        }
                    });
                });
    }
}