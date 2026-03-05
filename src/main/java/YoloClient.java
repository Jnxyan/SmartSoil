import com.github.sarxos.webcam.Webcam;
import com.github.sarxos.webcam.WebcamPanel;
import com.github.sarxos.webcam.WebcamResolution;
import org.json.JSONArray;
import org.json.JSONObject;

import javax.swing.*;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.io.ByteArrayOutputStream;
import javax.imageio.ImageIO;

public class YoloClient {

    private static JSONArray latestDetections = new JSONArray();

    public static void main(String[] args) throws Exception {
        Webcam webcam = Webcam.getDefault();
        Dimension vgaSize = WebcamResolution.VGA.getSize(); // 640x480
        webcam.setViewSize(vgaSize);

        WebcamPanel panel = new WebcamPanel(webcam) {
            @Override
            public void paintComponent(Graphics g) {
                super.paintComponent(g);
                Graphics2D g2 = (Graphics2D) g;

                // --- ACCURACY CORRECTION: SCALING ---
                // Calculate scale if the window size differs from 640x480
                double scaleX = (double) getWidth() / vgaSize.width;
                double scaleY = (double) getHeight() / vgaSize.height;

                g2.setStroke(new BasicStroke(3));
                g2.setColor(Color.RED);
                g2.setFont(new Font("Arial", Font.BOLD, 16));

                synchronized (latestDetections) {
                    for (int i = 0; i < latestDetections.length(); i++) {
                        JSONObject det = latestDetections.getJSONObject(i);

                        // Scale the coordinates to match the current window size
                        int w = (int) (det.getInt("width") * scaleX);
                        int h = (int) (det.getInt("height") * scaleY);
                        int x = (int) ((det.getInt("x") * scaleX) - (w / 2));
                        int y = (int) ((det.getInt("y") * scaleY) - (h / 2));

                        String label = det.getString("class") + " (" + (int)(det.getDouble("confidence") * 100) + "%)";

                        g2.drawRect(x, y, w, h);
                        g2.drawString(label, x, y - 10);
                    }
                }
            }
        };

        panel.setFPSDisplayed(true);
        panel.setFillArea(true); // Ensures the image fills the panel

        JFrame window = new JFrame("Chili Plant Detector");
        window.add(panel);
        window.pack();
        window.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        window.setVisible(true);

        HttpClient client = HttpClient.newHttpClient();

        while (true) {
            BufferedImage image = webcam.getImage();
            if (image != null) {
                byte[] imageBytes = toByteArray(image);

                HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create("http://localhost:8001/predict"))
                        .header("Content-Type", "application/octet-stream")
                        .POST(HttpRequest.BodyPublishers.ofByteArray(imageBytes))
                        .build();

                client.sendAsync(request, HttpResponse.BodyHandlers.ofString())
                        .thenApply(HttpResponse::body)
                        .thenAccept(result -> {
                            // --- ADDED YOUR PRINT LINE HERE ---
                            System.out.println("AI Result: " + result);

                            try {
                                JSONObject json = new JSONObject(result);
                                synchronized (latestDetections) {
                                    latestDetections = json.getJSONArray("predictions");
                                }
                                panel.repaint();
                            } catch (Exception e) {
                                // Silent fail if JSON is malformed or empty
                            }
                        });
            }
            Thread.sleep(400); // Slight delay for stability
        }
    }

    private static byte[] toByteArray(BufferedImage img) throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageIO.write(img, "jpg", baos);
        return baos.toByteArray();
    }
}